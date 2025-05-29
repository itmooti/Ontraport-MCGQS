import Config from "./config.js";

export default class ChartApp {
  static refererNameCondition = "";
  static updatedGranualarity = "weekly";

  constructor() {
    const statuses = Config.jobStatuses;
    this.entities = ["Jobs", "Contacts", ...statuses.map((s) => s.type)];
    this.colors = {
      Jobs: "#3b82f6",
      Contacts: "#8b5cf6",
      ...statuses.reduce((acc, s) => {
        acc[s.type] = s.color;
        return acc;
      }, {}),
    };
    this.traces = {
      bar: [],
      line: [],
      area: [],
      stacked: [],
      spline: [],
      step: [],
    };
    this.readyCount = 0;
    this.keepAliveInterval = null;
    this.currentGranularity = "weekly";
    this.selectedStart = null;
    this.selectedEnd = null;
    this.sockets = [];
  }

  get wsUrl() {
    return Config.wsUrl;
  }

  resetTraces() {
    Object.keys(this.traces).forEach((k) => (this.traces[k] = []));
  }

  buildTraces(entity, rows, bucketKey) {
    const x = [],
      y = [];
    rows.forEach((r) => {
      x.push(r[bucketKey]);
      y.push(r.totalCount || 0);
    });
    const clr = this.colors[entity] || "#999";
    this.traces.bar.push({
      x,
      y,
      name: entity,
      type: "bar",
      marker: { color: clr },
    });
    this.traces.line.push({
      x,
      y,
      name: entity,
      type: "scatter",
      mode: "lines",
      marker: { color: clr },
    });
    this.traces.area.push({
      x,
      y,
      name: entity,
      type: "scatter",
      mode: "lines",
      fill: "tozeroy",
      marker: { color: clr },
    });
    this.traces.stacked.push({
      x,
      y,
      name: entity,
      type: "bar",
      marker: { color: clr },
    });
    this.traces.spline.push({
      x,
      y,
      name: entity,
      type: "scatter",
      mode: "lines",
      line: { shape: "spline" },
      marker: { color: clr },
    });
    this.traces.step.push({
      x,
      y,
      name: entity,
      type: "scatter",
      mode: "lines",
      line: { shape: "hv" },
      marker: { color: clr },
    });
  }

  renderCharts() {
    const commonLayout = {
      yaxis: { title: "Count" },
      legend: {
        orientation: "h",
        x: 0,
        xanchor: "left",
        y: 1.15,
        yanchor: "top",
      },
      margin: { t: 60, l: 60, r: 30, b: 120 },
      barmode: "group",
    };
    const stackedLayout = { ...commonLayout, barmode: "stack" };

    // Compute totals for gauge — one gauge per STATUS if you like, but here's the original single-gauge logic:
    const totalJobs = this.traces.bar
      .find((t) => t.name === "Jobs")
      .y.reduce((sum, v) => sum + v, 0);

    // Pick the first status for gauge (just like before)
    const firstStatus = Config.jobStatuses[0];
    const statusJobs =
      this.traces.bar
        .find((t) => t.name === firstStatus.type)
        ?.y.reduce((sum, v) => sum + v, 0) || 0;

    const gaugeLayout = {
      margin: { t: 60, b: 40, l: 20, r: 20 },
      title: {
        text: `${firstStatus.type} of Total Jobs`,
        x: 0.5,
        xanchor: "center",
        font: { size: 18 },
      },
      showlegend: true,
    };

    const chartConfig = [
      { id: "barChart", key: "bar", layout: commonLayout },
      { id: "lineChart", key: "line", layout: commonLayout },
      { id: "areaChart", key: "area", layout: commonLayout },
      { id: "stackedBarChart", key: "stacked", layout: stackedLayout },
      { id: "splineChart", key: "spline", layout: commonLayout },
      { id: "stepChart", key: "step", layout: commonLayout },
      { id: "comboChart", key: null, layout: commonLayout },
      { id: "gaugeChart", key: "gauge", layout: gaugeLayout },
    ];

    chartConfig.forEach((c) => {
      if (c.key === "gauge") {
        const gaugeTrace = [
          {
            type: "indicator",
            mode: "gauge",
            value: statusJobs,
            gauge: {
              axis: { range: [0, totalJobs] },
              bar: { color: this.colors[firstStatus.type] },
              steps: [
                {
                  range: [0, statusJobs],
                  color: this.colors[firstStatus.type],
                },
                { range: [statusJobs, totalJobs], color: this.colors["Jobs"] },
              ],
            },
          },
        ];
        Plotly.newPlot(c.id, gaugeTrace, c.layout);
      } else if (c.id === "comboChart") {
        Plotly.newPlot(
          c.id,
          this.traces.bar.concat(this.traces.line),
          c.layout
        );
      } else {
        Plotly.newPlot(c.id, this.traces[c.key], c.layout);
      }
    });
  }

  buildSubscriptionQuery(entity, granularity) {
    let B = "X_WEEK_BEGIN",
      E = "X_WEEK_END",
      F = "DAY";
    if (granularity === "monthly") {
      B = "X_MONTH_BEGIN";
      E = "X_MONTH_END";
      F = "Week-WK";
    }
    if (granularity === "yearly") {
      B = "X_YEAR_BEGIN";
      E = "X_YEAR_END";
      F = "MONTH";
    }

    // LOOK UP THE RIGHT CONDITION FOR THIS ENTITY
    const jobStatus = Config.jobStatuses.find((s) => s.type === entity) || {};
    const statusFilter =
      entity === jobStatus.type
        ? `{andWhere:{job_status:"${jobStatus.condition}"}}`
        : "";
    const target = entity === jobStatus.type ? "Jobs" : entity;
    const referralFilter =
      entity === "Jobs" || entity === jobStatus.type
        ? `{andWhere: {Referral_Source: [{where: {Company: [{ where: { name: "${Config.visitorReferralSource}" } }]}}]}}`
        : "";

    return {
      query: `
        subscription sub${target}($${B}:TimestampSecondsScalar,$${E}:TimestampSecondsScalar){
          subscribeToCalc${target}(query:[
            {where:{created_at:$${B},_OPERATOR_:gte}}
            {andWhere:{created_at:$${E},_OPERATOR_:lte}}
             ${statusFilter}
             ${referralFilter}
             ${ChartApp.refererNameCondition}
          ]){
            totalCount:count(args:[{field:["id"]}])
            bucket:field(arg:["created_at"])@dateFormat(value:"${F}")
          }
        }`,
      variables: { [B]: 0, [E]: 0 },
    };
  }

  initializeSocket(entity, granularity) {
    const socket = new WebSocket(this.wsUrl, "vitalstats");
    this.sockets.push(socket);

    socket.onopen = () => {
      this.keepAliveInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify({ type: "KEEP_ALIVE" }));
      }, 28000);
      socket.send(JSON.stringify({ type: "CONNECTION_INIT" }));
      const { query, variables } = this.buildSubscriptionQuery(
        entity,
        granularity
      );
      socket.send(
        JSON.stringify({
          id: `sub_${entity}`,
          type: "GQL_START",
          payload: { query, variables },
        })
      );
    };

    socket.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === "GQL_DATA" && d.payload?.data) {
        const rows = Object.values(d.payload.data)[0] || [];
        this.buildTraces(entity, rows, "bucket");
        this.readyCount++;
        if (this.readyCount === this.entities.length) {
          clearInterval(this.keepAliveInterval);
          document.getElementById("barLoader").classList.add("hidden");
          const hasData = this.traces.bar.some((t) => t.y.some((v) => v > 0));
          if (hasData) {
            document.getElementById("chartGrid").classList.remove("hidden");
            this.renderCharts();
          } else {
            document.getElementById("noDataMessage").classList.remove("hidden");
          }
        }
      }
    };
    socket.onerror = () => console.error(`WS error ${entity}`);
    socket.onclose = () => clearInterval(this.keepAliveInterval);
  }

  closeSockets() {
    this.sockets.forEach((s) => {
      try {
        s.close();
      } catch (_) {}
    });
    this.sockets = [];
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
  }

  loadData(granularity) {
    this.closeSockets();
    this.readyCount = 0;
    this.resetTraces();
    document.getElementById("chartGrid").classList.add("hidden");
    document.getElementById("noDataMessage").classList.add("hidden");
    document.getElementById("barLoader").classList.remove("hidden");
    this.entities.forEach((e) => this.initializeSocket(e, granularity));
  }

  setupControls() {
    this.loadData(this.currentGranularity);
    ["weeklyBtn", "monthlyBtn", "yearlyBtn"].forEach((id) => {
      document.getElementById(id).addEventListener("click", () => {
        this.currentGranularity = id.replace("Btn", "");
        ChartApp.updatedGranularity = this.currentGranularity;
        ["weeklyBtn", "monthlyBtn", "yearlyBtn"].forEach((x) => {
          document
            .getElementById(x)
            .classList.replace("bg-[var(--basic-color-bg-F7F7F7)] text-dark", "bg-gray-300");
          document
            .getElementById(x)
            .classList.replace("text-white", "text-gray-700");
        });
        document
          .getElementById(id)
          .classList.replace("bg-gray-300", "bg-[var(--basic-color-bg-F7F7F7)] text-dark");
        document
          .getElementById(id)
          .classList.replace("text-gray-700", "text-white");
        this.loadData(this.currentGranularity);
      });
    });



    // Multi-select dropdown
    const multiselect = document.getElementById("multiselect");
    const toggle = document.getElementById("dropdown-toggle");
    const input = document.getElementById("dropdown-input");
    const list = document.getElementById("dropdown-list");
    const selectedContainer = document.getElementById("selected-items");
    const dropdownEntities = [...this.entities];
    let selectedEntities = [...this.entities];

    const populateList = () => {
      list.innerHTML = "";
      dropdownEntities.forEach((item) => {
        const li = document.createElement("li");
        li.className =
          "flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer";
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          const idx = selectedEntities.indexOf(item);
          if (idx > -1) selectedEntities.splice(idx, 1);
          else selectedEntities.push(item);
          updateSelected();
          populateList();
        });
        const box = document.createElement("div");
        box.className =
          "w-4 h-4 mr-2 border rounded-sm flex items-center justify-center";
        if (selectedEntities.includes(item)) {
          if (item === jobStatusType) {
            box.setAttribute("data-id", jobStatusType);
          }
          box.classList.add("border-blue-600");
          box.innerHTML = `<svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>`;
        }
        li.append(box, document.createTextNode(item));
        list.appendChild(li);
      });
      const applyLi = document.createElement("li");
      applyLi.className =
        "px-2 py-2 flex justify-center hover:bg-gray-100 cursor-pointer";
      const applyButton = document.createElement("button");
      applyButton.textContent = "Apply";
      applyButton.className = "bg-blue-600 text-white px-3 py-1 rounded w-full";
      applyButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.entities.splice(0, this.entities.length, ...selectedEntities);
        list.classList.add("hidden");
        if (this.selectedStart && this.selectedEnd)
          this.loadCustomRange(this.selectedStart, this.selectedEnd);
        else this.loadData(this.currentGranularity);
        updateSelected();
      });
      applyLi.appendChild(applyButton);
      list.appendChild(applyLi);
    };

    const updateSelected = () => {
      selectedContainer.innerHTML = "";
      selectedEntities.forEach((item) => {
        const badge = document.createElement("div");
        badge.className =
          "flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm";
        badge.textContent = item;
        const remove = document.createElement("span");
        remove.innerHTML = "×";
        remove.className = "ml-1 cursor-pointer";
        remove.addEventListener("click", (e) => {
          e.stopPropagation();
          selectedEntities.splice(selectedEntities.indexOf(item), 1);
          updateSelected();
          populateList();
        });
        badge.appendChild(remove);
        selectedContainer.appendChild(badge);
      });
      input.value = selectedEntities.join(", ");
    };

    const openDropdown = () => {
      populateList();
      list.classList.remove("hidden");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      openDropdown();
    });
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      openDropdown();
    });
    document.addEventListener("click", (e) => {
      if (!multiselect.contains(e.target)) list.classList.add("hidden");
    });

    updateSelected();
  }

  start() {
    this.setupControls();
  }
  refererConditionUpdater(name) {
    console.log("ChartApp text method called", name);
    if (!name) {
      ChartApp.refererNameCondition = "";
    } else {
      ChartApp.refererNameCondition = `{ andWhere: { Referrer: [{ where: { id: ${name} } }] } }`;
    }
    const granularity = ChartApp.updatedGranularity || "weekly";
    console.log("granualarity is", granularity);
    this.loadData(granularity);
  }
}
