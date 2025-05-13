  const apiKey = "zeYfVRNaPP_E-fQxxHelQ";
  const apiEndpoint = "https://mcgqs.vitalstats.app/api/v1/graphql";
  let formToggler = document.querySelectorAll(".formToggler");
  let testForm = document.querySelector(".testForm");
  let customOverlay = document.querySelector(".customOverlay");
  let formClose = document.querySelector(".formClose");
  const searchInput = document.getElementById("searchInputPartners");
  const searchQueryContent = document.querySelector(".searchQueryContent");
  const tableHeaders = document.querySelectorAll("th[data-field]");


  let state = {
    page: 1,
    limit: 10,
    sortField: "created_at",
    sortOrder: "desc",
  };

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      fetchPartners();
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
      fetchPartners();
      updateSortIndicators();
    });
  });

  function updateSearchTags() {
    searchQueryContent.innerHTML = "";
    if (state.search) {
      const tag = createTag("Search query", state.search, () => {
        state.search = "";
        searchInput.value = "";
        state.page = 1;
        fetchPartners();
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

async function fetchPartners() {
  renderLoading();
  const offset  = (state.page - 1) * state.limit;
  const orderBy = buildOrderByClause();

  // build clauses array, starting with the default company filter
  const clauses = [];
  clauses.push({
    kind: "where",
    content: `Company: [ { where: { name: "${companyName}" } } ]`
  });

  // if the user has typed a search, chain it on
  if (state.search) {
    const s = state.search.trim().replace(/"/g, '\\"');
    clauses.push({
      kind: "andWhere",
      content: `link_name: "${s}", _OPERATOR_: like`
    });
  }

  // turn clauses[] into the `query: [ … ]` arg
  let queryArg = "";
  if (clauses.length) {
    const arr = clauses.map((c, i) => {
      const wrapper = i === 0 && c.kind === "where" ? "where" : c.kind;
      return `{ ${wrapper}: { ${c.content} } }`;
    }).join(", ");
    queryArg = `query: [ ${arr} ],`;
  }

  const gql = `
    query fetchPartners($limit: IntScalar, $offset: IntScalar) {
      calcPartnerLinks(
        ${queryArg}
        limit:  $limit
        offset: $offset
        ${orderBy}
      ) {
        id:            field(arg:["id"])
        uniqueId:      field(arg:["unique_id"])
        linkName:      field(arg:["link_name"])
        jobsReferred:  field(arg:["jobs_referred"])
        completedJobs: field(arg:["completed_jobs"])
        dateAdded:     field(arg:["created_at"]) @dateFormat(value: "MM-DD-YYYY")
      }
    }`;

  const res = await fetch(apiEndpoint, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key":       apiKey
    },
    body: JSON.stringify({
      query:     gql,
      variables: { limit: state.limit, offset }
    })
  });

  const { data, errors } = await res.json();
  if (errors || !data?.calcPartnerLinks) {
    console.error("GraphQL error:", errors);
    renderTable([]); renderFooter(0); renderPagination(0);
    return;
  }

  renderTable(data.calcPartnerLinks);
  renderFooter(data.calcPartnerLinks.length);
  renderPagination(data.calcPartnerLinks.length);
}


  function renderLoading() {
    document.getElementById("total-info").textContent = "";
    document.getElementById("pagination").innerHTML = "";
    $("#table-body").html(`
      <tr>
        <td colspan="8" class="px-4 py-2 text-center text-gray-500">
          Loading partners…
        </td>
      </tr>
    `);
  }

  function renderTable(contacts) {
    if (!contacts.length) {
      $("#table-body").html(
        `<tr><td colspan="8" class="px-4 py-2 text-center text-gray-500">No partners found.</td></tr>`
      );
      return;
    }
    const tmpl = $.templates("#contact-row-tmpl");
    $("#table-body").html(tmpl.render(contacts));
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
      fetchPartners();
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
      fetchPartners();
    });
    container.appendChild(next);
  }

  document.getElementById("page-size-select").addEventListener("change", (e) => {
    state.limit = parseInt(e.target.value, 10);
    state.page = 1;
    fetchPartners();
  });

  document.addEventListener("DOMContentLoaded", () => {
    updateSearchTags();
    initSortIndicators();
    updateSortIndicators();
    fetchPartners();
  });
