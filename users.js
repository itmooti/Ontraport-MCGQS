const apiKey = "zeYfVRNaPP_E-fQxxHelQ";
    const apiEndpoint = "https://mcgqs.vitalstats.app/api/v1/graphql";
    let formToggler = document.querySelectorAll(".formToggler");
    let addUserForm = document.querySelector(".addUserForm ");
    let customOverlay = document.querySelector(".customOverlay");
    let formClose = document.querySelector(".formClose");
    const searchInput = document.getElementById("searchInputUsers");
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
            fetchContacts();
            updateSearchTags();
        }, 300);
    });

    function showForm() {
        addUserForm?.classList.remove("!translate-x-full"); //hidden initially
        addUserForm?.classList.add("!translate-x-0");
        customOverlay?.classList.remove("hidden");
    }
    function hideForm() {
        addUserForm?.classList.add("!translate-x-full"); //hidden initially
        addUserForm?.classList.remove("!translate-x-0");
        customOverlay?.classList.add("hidden");
    }

    if (formToggler.length > 0) {
        formToggler.forEach((btn) => btn.addEventListener("click", showForm));
    }

    formClose?.addEventListener("click", hideForm);


function initSortIndicators() {
  tableHeaders.forEach((th) => {
    const span = th.querySelector("span");
    if (span && !span.querySelector(".sort-indicator")) {
      const indicator = document.createElement("span");
      indicator.className = "sort-indicator ml-1 text-[8px]";
      indicator.textContent = "▼";
      span.appendChild(indicator);
    }
  });
}
function updateSortIndicators() {
  tableHeaders.forEach((th) => {
    const span = th.querySelector("span")?.querySelector(".sort-indicator");
    if (span) {
      if (th.dataset.field === state.sortField) {
        span.textContent = state.sortOrder === "asc" ? "▲" : "▼";
      } else {
        span.textContent = "▼";
      }
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
            fetchContacts();
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
                fetchContacts();
                updateSearchTags();
            });
            searchQueryContent.appendChild(tag);
        }
    }

    function createTag(label, value, onRemove) {
        const span = document.createElement("span");
        span.className = "filter-tag bg-[var(--basic-color-bg-F7F7F7)] text-dark py-2 px-3 rounded-[30px] border border-[var(--basic-color-primary-8CBE3F)] flex items-center gap-x-2 w-max ";
        span.textContent = `${label}: ${value} `;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "remove-tag flex items-center justify-center border border-[var(--basic-color-primary-8CBE3F)] rounded-full p-1 aspect-square text-[var(--primary-color)]";
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

   async function fetchContacts() {
        renderLoading();
        const offset = (state.page - 1) * state.limit;

        const queryClauses = [
            `{ where: { Company: [ { where: { name: "${companyName}" } } ] } }`
        ];

        if (state.search) {
            const searchTerm = `%${state.search.trim()}%`;

            const clientConditions = [
                `{
         where: {
           first_name: null,
           _OPERATOR_: like,
           _VALUE_EXPRESSION_: "${searchTerm}"
         }
       }`,
                `{
         orWhere: {
           last_name: null,
           _OPERATOR_: like,
           _VALUE_EXPRESSION_: "${searchTerm}"
         }
       }`
            ];

            if (state.search.includes("@")) {
                clientConditions.push(`{
        orWhere: {
          email: null,
          _OPERATOR_: like,
          _VALUE_EXPRESSION_: "${searchTerm}"
        }
      }`);
            }

            queryClauses.push(`{
      andWhereGroup: [
        ${clientConditions.join(",")}
      ]
    }`);
        }

        const gql = `
    query calcContacts($limit: IntScalar, $offset: IntScalar) {
      calcContacts(
        query: [ ${queryClauses.join(",")} ]
        limit: $limit
        offset: $offset
        orderBy: [{ path: ["created_at"], type: ${state.sortOrder} }]
      ) {
        id:        field(arg:["id"])
        uniqueId:  field(arg:["unique_id"])
        fName:     field(arg:["first_name"])
        lName:     field(arg:["last_name"])
        email:     field(arg:["email"])
        phone:     field(arg:["sms_number"])
        dateAdded: field(arg:["created_at"]) @dateFormat(value: "MM-DD-YYYY")
        account_manager_override_inactive: field(arg:["account_manager_override_inactive"])
      }
    }
  `;

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
        if (errors || !data?.calcContacts) {
            console.error("GraphQL error:", errors);
            renderTable([]);
            renderFooter(0);
            renderPagination(0);
            return;
        }

        renderTable(data.calcContacts);
        renderFooter(data.calcContacts.length);
        renderPagination(data.calcContacts.length);
    }



    function renderLoading() {
        document.getElementById("total-info").textContent = "";
        document.getElementById("pagination").innerHTML = "";
        $("#table-body").html(`
      <tr>
        <td colspan="8" class="px-4 py-2 text-center text-gray-500">
          Loading users…
        </td>
      </tr>
    `);
    }

    function renderTable(contacts) {
        if (!contacts.length) {
            $("#table-body").html(
                `<tr><td colspan="8" class="px-4 py-2 text-center text-gray-500">No users found.</td></tr>`
            );
            return;
        }
        const tmpl = $.templates("#contact-row-tmpl");
        $("#table-body").html(tmpl.render(contacts));
    }

    function renderFooter(count) {
        document.getElementById("total-info").textContent = count
            ? "Showing " + count + " item" + (count > 1 ? "s" : "")
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
            fetchContacts();
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
            fetchContacts();
        });
        container.appendChild(next);
    }

    document.getElementById("page-size-select").addEventListener("change", (e) => {
        state.limit = parseInt(e.target.value, 10);
        state.page = 1;
        fetchContacts();
    });

    document.addEventListener("DOMContentLoaded", () => {
        updateSearchTags();
        initSortIndicators();
        updateSortIndicators();
        fetchContacts();
    });

    const toastContainer = document.getElementById('toast-container');
    function showToast(message, isError = false) {
        const div = document.createElement('div');
        div.className = [
            'px-4 py-2 rounded shadow-lg pointer-events-auto',
            isError ? 'bg-red-500 text-white' : 'bg-[var(--primary-color)] text-white'
        ].join(' ');
        div.textContent = message;
        toastContainer.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    // delegate any toggle flip
    document.addEventListener('change', async e => {
        if (!e.target.matches('.toggle-access')) return;
        const cb = e.target;
        const id = Number(cb.dataset.id);
        const fName = cb.dataset.fname;
        const lName = cb.dataset.lname;
        const isInactive = cb.checked;
        cb.disabled = true;

        const mutation = `
            mutation updateContact($id: McgqsContactID, $payload: ContactUpdateInput) {
              updateContact(
                query: [{ where: { id: $id } }],
                payload: $payload
              ) {
                account_manager_override_inactive
              }
            }
  		`;

        try {
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': apiKey
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        id,
                        payload: { account_manager_override_inactive: isInactive }
                    }
                })
            });
            const { data, errors } = await res.json();
            if (errors) throw errors;

            showToast(`${fName} ${lName} access ${isInactive ? 'disabled' : 'enabled'}`);
        } catch (err) {
            console.error(err);
            cb.checked = !isInactive;
            showToast(`Failed to update ${fName} ${lName}`, true);
        } finally {
            cb.disabled = false;
        }
    });
