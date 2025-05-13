 const apiKey = "zeYfVRNaPP_E-fQxxHelQ";
  const apiEndpoint = "https://mcgqs.vitalstats.app/api/v1/graphql";
  let formToggler = document.querySelectorAll(".formToggler");
  let testForm = document.querySelector(".testForm");
  let customOverlay = document.querySelector(".customOverlay");
  let formClose = document.querySelector(".formClose");
  const searchInput = document.getElementById("searchInputJobs");
  const searchQueryContent = document.querySelector(".searchQueryContent");
  const jobBtn = document.getElementById("job-filter-btn");
  const jobDropdown = document.getElementById("job-filter-dropdown");
  const jobSelected = document.getElementById("job-selected-filter");
  const jobOptions = document.getElementById("job-filter-options");
  const quoteBtn = document.getElementById("quote-filter-btn");
  const quoteDropdown = document.getElementById("quote-filter-dropdown");
  const quoteSelected = document.getElementById("quote-selected-filter");
  const quoteOptions = document.getElementById("quote-filter-options");
  const tableHeaders = document.querySelectorAll("th[data-field]");

const filterOptionsDataJobStatus = [
  {
    value: "2236",
    label: "No Response",
    color: "#283593",
    backgroundColor: "#d4d7e9",
  },
  {
    value: "586",
    label: "Cancelled",
    color: "#000000",
    backgroundColor: "#cccccc",
  },
  {
    value: "342",
    label: "On Hold",
    color: "#616161",
    backgroundColor: "#dfdfdf",
  },
  {
    value: "548",
    label: "New Booking",
    color: "#26c6da",
    backgroundColor: "#d4f4f8",
  },
  {
    value: "341",
    label: "Pending Admin Review",
    color: "#8e24aa",
    backgroundColor: "#e8d3ee",
  },
  {
    value: "340",
    label: "Waiting On Info",
    color: "#d84315",
    backgroundColor: "#f7d9d0",
  },
  {
    value: "517",
    label: "Info Submitted",
    color: "#d84315",
    backgroundColor: "#f7d9d0",
  },
  {
    value: "339",
    label: "Pending Inspection",
    color: "#f9a825",
    backgroundColor: "#feeed3",
  },
  {
    value: "338",
    label: "In Progress",
    color: "#00acc1",
    backgroundColor: "#cceef3",
  },
  {
    value: "337",
    label: "Waiting on Payment",
    color: "#f9a825",
    backgroundColor: "#feeed3",
  },
  {
    value: "477",
    label: "Send Report",
    color: "#96ba4c",
    backgroundColor: "#eaf1db",
  },
  {
    value: "336",
    label: "Report Sent",
    color: "#43a047",
    backgroundColor: "#d9ecda",
  },
  {
    value: "498",
    label: "Report Sent - Awaiting Payment",
    color: "#f9a825",
    backgroundColor: "#feeed3",
  },
];

const filterOptionsDataQuoteStatus = [
  {
    value: "2041",
    label: "Accepted",
    color: "#9CCC65",
    backgroundColor: "#EBF5E0",
  },
  {
    value: "252",
    label: "Sent - Pending Acceptance",
    color: "#D81B60",
    backgroundColor: "#F7D1DF",
  },
  {
    value: "253",
    label: "New - Pending Review",
    color: "#0097A7",
    backgroundColor: "#CCEAED",
  },
  {
    value: "774",
    label: "New - Bypass Review",
    color: "#0097A7",
    backgroundColor: "#CCEAED",
  },
  {
    value: "2234",
    label: "Queued to Send",
    color: "#1E88E5",
    backgroundColor: "#D2E7FA",
  },
  {
    value: "2147",
    label: "Booking Confirmed",
    color: "#8E24AA",
    backgroundColor: "#E8D3EE",
  },
  {
    value: "2260",
    label: "Enquiry",
    color: "#1E88E5",
    backgroundColor: "#D2E7FA",
  },
  {
    value: "2148",
    label: "Duplicated Job",
    color: "#F57F17",
    backgroundColor: "#FDE5D1",
  },
  {
    value: "1789",
    label: "Cancelled",
    color: "#000000",
    backgroundColor: "#CCCCCC",
  },
  {
    value: "1788",
    label: "Declined",
    color: "#EF5350",
    backgroundColor: "#FCDDDC",
  },
  {
    value: "1790",
    label: "Expired",
    color: "#FFCA28",
    backgroundColor: "#FFF4D4",
  },
];

let state = {
  page: 1,
  limit: 10,
  jobStatus: "",
  quoteStatus: "",
  sortField: "created_at",
  sortOrder: "desc",
};

let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    state.search = e.target.value.trim();
    state.page = 1;
    fetchJobs();
    updateSearchTags();
  }, 300);
});

function showForm() {
  testForm?.classList.remove("hidden");
  customOverlay?.classList.remove("hidden");
}
function hideForm() {
  testForm?.classList.add("hidden");
  customOverlay?.classList.add("hidden");
}
if (formToggler.length > 0) {
  formToggler.forEach((btn) => btn.addEventListener("click", showForm));
}
formClose?.addEventListener("click", hideForm);

function populateFilter(opts, ulEl, allLabel) {
  ulEl.innerHTML = "";
  const defaultLi = document.createElement("li");
  defaultLi.textContent = allLabel;
  defaultLi.dataset.value = "";
  defaultLi.className = "px-4 py-2 cursor-pointer hover:bg-gray-100";
  defaultLi.style.backgroundColor = "#ffffff";
  defaultLi.style.color = "#000000";
  ulEl.appendChild(defaultLi);
  opts.forEach((o) => {
    const li = document.createElement("li");
    li.textContent = o.label;
    li.dataset.value = o.label;
    li.className = "px-4 py-2 cursor-pointer hover:opacity-90";
    li.style.backgroundColor = o.backgroundColor;
    li.style.color = o.color;
    ulEl.appendChild(li);
  });
}

populateFilter(filterOptionsDataJobStatus, jobOptions, "All Jobs");
populateFilter(filterOptionsDataQuoteStatus, quoteOptions, "All Quotes");

jobBtn.addEventListener("click", () => jobDropdown.classList.toggle("hidden"));
jobOptions.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    state.jobStatus = e.target.dataset.value;
    jobSelected.textContent = state.jobStatus || "All Jobs";
    state.page = 1;
    fetchJobs();
    updateSearchTags();
    jobDropdown.classList.add("hidden");
  }
});

quoteBtn.addEventListener("click", () =>
  quoteDropdown.classList.toggle("hidden")
);
quoteOptions.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    state.quoteStatus = e.target.dataset.value;
    quoteSelected.textContent = state.quoteStatus || "All Quotes";
    state.page = 1;
    fetchJobs();
    updateSearchTags();
    quoteDropdown.classList.add("hidden");
  }
});

document.addEventListener("click", (e) => {
  if (!jobBtn.contains(e.target) && !jobDropdown.contains(e.target))
    jobDropdown.classList.add("hidden");
  if (!quoteBtn.contains(e.target) && !quoteDropdown.contains(e.target))
    quoteDropdown.classList.add("hidden");
});

function initSortIndicators() {
  tableHeaders.forEach((th) => {
    if (!th.querySelector(".sort-indicator")) {
      const span = document.createElement("span");
      span.className = "sort-indicator";
      th.appendChild(span);
    }
  });
}

function updateSortIndicators() {
  tableHeaders.forEach((th) => {
    const span = th.querySelector(".sort-indicator");
    if (th.dataset.field === state.sortField) {
      span.textContent = state.sortOrder === "asc" ? "▲" : "▼";
    } else {
      span.textContent = "▼";
    }
  });
}

tableHeaders.forEach((th) => {
  th.addEventListener("click", () => {
    const field = th.dataset.field;
    if (state.sortField === field) {
      state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
    } else {
      state.sortField = field;
      state.sortOrder = "asc";
    }
    state.page = 1;
    fetchJobs();
    updateSortIndicators();
  });
});

function updateSearchTags() {
  searchQueryContent.innerHTML = "";
  if (state.jobStatus) {
    const tag = createTag("Filtered by Job Status", state.jobStatus, () => {
      state.jobStatus = "";
      jobSelected.textContent = "All Jobs";
      state.page = 1;
      fetchJobs();
      updateSearchTags();
    });
    searchQueryContent.appendChild(tag);
  }
  if (state.quoteStatus) {
    const tag = createTag("Filtered by Quote Status", state.quoteStatus, () => {
      state.quoteStatus = "";
      quoteSelected.textContent = "All Quotes";
      state.page = 1;
      fetchJobs();
      updateSearchTags();
    });
    searchQueryContent.appendChild(tag);
  }
  if (state.search) {
    const tag = createTag("Search query", state.search, () => {
      state.search = "";
      searchInput.value = "";
      state.page = 1;
      fetchJobs();
      updateSearchTags();
    });
    searchQueryContent.appendChild(tag);
  }
}

function createTag(label, value, onRemove) {
  const span = document.createElement("span");
  span.className = "filter-tag p-1 bg-[var(--complementary-color)] text-[var(--white-color)] italic";
  span.textContent = `${label}: ${value} `;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "remove-tag";
  btn.textContent = "×";
  btn.onclick = onRemove;
  span.appendChild(btn);
  return span;
}

function buildOrderByClause() {
  const parts = state.sortField.split(".");
  const paths = parts.map((p) => `"${p}"`).join(", ");
  return `orderBy: [{ path: [${paths}], type: ${state.sortOrder} }]`;
}

async function fetchJobs() {
  renderLoading();
  const offset = (state.page - 1) * state.limit;
  const orderBy = buildOrderByClause();

  const clauses = [];
  clauses.push({
    kind: "where",
    content: `
      Referral_Source: [
        { where: { Company: [ { where: { name: "${companyName}" } } ] } }
      ]
    `
  });
  
  if (state.jobStatus) {
    clauses.push({
      kind: "andWhere",
      content: `job_status: "${state.jobStatus}"`,
    });
  }
  if (state.quoteStatus) {
    clauses.push({
      kind: "andWhere",
      content: `quote_status: "${state.quoteStatus}"`,
    });
  }

  if (state.search) {
    const s = state.search.trim().replace(/"/g, '\\"');
    const clientFilters = [
      `{ where: { first_name: "${s}", _OPERATOR_: like } }`,
      `{ orWhere: { last_name:  "${s}", _OPERATOR_: like } }`,
    ];
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRx.test(s)) {
      clientFilters.push(`{ orWhere: { email: "${s}", _OPERATOR_: like } }`);
    }
    clauses.push({
      kind: "orWhere",
      content: `Client: [${clientFilters.join(",")}]`,
    });
    clauses.push({
      kind: "orWhere",
      content: `Property: [ { where: { property_name: "${s}", _OPERATOR_: like } } ]`,
    });
  }

  let queryArg = "";
  if (clauses.length) {
    const arr = clauses
      .map((c, i) => {
        const wrapper = i === 0 && c.kind === "where" ? "where" : c.kind;
        return `{ ${wrapper}: { ${c.content} } }`;
      })
      .join(", ");
    queryArg = `query: [ ${arr} ],`;
  }

  const gql = `
    query fetchJobs($limit: IntScalar, $offset: IntScalar) {
      calcJobs(
        ${queryArg}
        limit:  $limit
        offset: $offset
        ${orderBy}
      ) {
        id:              field(arg:["id"])
        uniqueId:        field(arg:["unique_id"])
        clientFirstName: field(arg:["Client","first_name"])
        clientLastName:  field(arg:["Client","last_name"])
        clientEmail:     field(arg:["Client","email"])
        quoteStatus:     field(arg:["quote_status"])
        jobStatus:       field(arg:["job_status"])
        propertyName:    field(arg:["Property","property_name"])
        dateAdded:       field(arg:["created_at"]) @dateFormat(value: "MM-DD-YYYY")
      }
    }`;

  const res = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({
      query: gql,
      variables: { limit: state.limit, offset },
    }),
  });

  const { data, errors } = await res.json();
  if (errors || !data?.calcJobs) {
    console.error("GraphQL error:", errors);
    renderTable([]);
    renderFooter(0);
    renderPagination(0);
    return;
  }

  const jobs = data.calcJobs.map((j) => {
    const js =
      filterOptionsDataJobStatus.find((o) => o.label === j.jobStatus) || {};
    const qs =
      filterOptionsDataQuoteStatus.find((o) => o.label === j.quoteStatus) || {};
    return {
      ...j,
      statusColor: js.color || "#333",
      statusBgColor: js.backgroundColor || "#eee",
      quoteColor: qs.color || "#333",
      quoteBgColor: qs.backgroundColor || "#eee",
    };
  });

  renderTable(jobs);
  renderFooter(jobs.length);
  renderPagination(jobs.length);
}

function renderLoading() {
  document.getElementById("total-info").textContent = "";
  document.getElementById("pagination").innerHTML = "";
  $("#table-body").html(`
    <tr>
      <td colspan="8" class="px-4 py-2 text-center text-gray-500">
        Loading jobs…
      </td>
    </tr>
  `);
}

function renderTable(jobs) {
  if (!jobs.length) {
    $("#table-body").html(
      `<tr><td colspan="8" class="px-4 py-2 text-center text-gray-500">No jobs found.</td></tr>`
    );
    return;
  }
  const tmpl = $.templates("#job-row-tmpl");
  $("#table-body").html(tmpl.render(jobs));
}

function renderFooter(count) {
  document.getElementById("total-info").textContent = count
    ? `Showing ${count} item${count > 1 ? "s" : ""}`
    : "No items to display";
}

function renderPagination(count) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  const prev = document.createElement("button");
  prev.textContent = "‹";
  prev.disabled = state.page === 1;
  prev.className =
    "px-3 py-1 border border-gray-300 bg-white text-gray-500 hover:bg-gray-100";
  prev.addEventListener("click", () => {
    state.page--;
    fetchJobs();
  });
  container.appendChild(prev);

  const pageNum = document.createElement("span");
  pageNum.textContent = state.page;
  pageNum.className =
    "px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700";
  container.appendChild(pageNum);

  const next = document.createElement("button");
  next.textContent = "›";
  next.disabled = count < state.limit;
  next.className =
    "px-3 py-1 border border-gray-300 bg-white text-gray-500 hover:bg-gray-100";
  next.addEventListener("click", () => {
    state.page++;
    fetchJobs();
  });
  container.appendChild(next);
}

document.getElementById("page-size-select").addEventListener("change", (e) => {
  state.limit = parseInt(e.target.value, 10);
  state.page = 1;
  fetchJobs();
});

document.addEventListener("DOMContentLoaded", () => {
  jobSelected.textContent = "All Jobs";
  quoteSelected.textContent = "All Quotes";
  updateSearchTags();
  initSortIndicators();
  updateSortIndicators();
  fetchJobs();
});
