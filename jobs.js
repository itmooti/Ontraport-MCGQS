  const apiKey = "zeYfVRNaPP_E-fQxxHelQ";
    const apiEndpoint = "https://mcgqs.vitalstats.app/api/v1/graphql";
    let formToggler = document.querySelectorAll(".formToggler");
    let testForm = document.querySelector(".testForm");
    let customOverlay = document.querySelector(".customOverlay");
    let formClose = document.querySelector(".formClose");
    const searchInput = document.getElementById("searchInputJobs");
    const searchQueryContent = document.querySelector(".searchQueryContent");
    const propertyTypeBtn = document.getElementById("property-type-filter-btn");
    const propertyTypeDropdown = document.getElementById("property-type-filter-dropdown");
    const propertyTypeSelected = document.getElementById("property-type-selected-filter");
    const propertyTypeOptions = document.getElementById("property-type-filter-options");
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

    propertyTypeBtn.addEventListener("click", () => propertyTypeDropdown.classList.toggle("hidden"));
    propertyTypeOptions.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            state.propertyTypeStatus = e.target.dataset.value;
            propertyTypeSelected.textContent = state.propertyTypeStatus || "All Types";
            state.page = 1;
            fetchJobs();
            updateSearchTags();
            propertyTypeDropdown.classList.add("hidden");
        }
    });


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

    quoteBtn.addEventListener("click", () => quoteDropdown.classList.toggle("hidden"));
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
        if (state.propertyTypeStatus) {
            const tag = createTag("Filtered by Property Type", state.propertyTypeStatus, () => {
                state.propertyTypeStatus = "";
                propertyTypeSelected.textContent = "All Types";
                state.page = 1;
                fetchJobs();
                updateSearchTags();
            });
            searchQueryContent.appendChild(tag);
        }

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

        // Base query structure
        const queryClauses = [
            `{
            where: {
                Referral_Source: [
                    {
                        where: {
                            Company: [
                                { 
                                    where: { 
                                        name: "${companyName}"
                                    } 
                                }
                            ]
                        }
                    }
                ]
            }
        }`
        ];

        // Add property type filter
        if (state.propertyTypeStatus) {
            queryClauses.push(`{
            andWhere: {
                property_type: "${state.propertyTypeStatus}"
            }
        }`);
        }

        // Add job status filter
        if (state.jobStatus) {
            queryClauses.push(`{
            andWhere: {
                job_status: "${state.jobStatus}"
            }
        }`);
        }

        // Add quote status filter
        if (state.quoteStatus) {
            queryClauses.push(`{
            andWhere: {
                quote_status: "${state.quoteStatus}"
            }
        }`);
        }

        // Handle search conditions
        if (state.search) {
            const searchTerm = `%${state.search.trim()}%`;
            const searchConditions = [];

            // Client name conditions
            const clientConditions = [
                `{
                where: {
                    first_name: null
                    _OPERATOR_: like
                    _VALUE_EXPRESSION_: "${searchTerm}"
                }
            }`,
                `{
                orWhere: {
                    last_name: null
                    _OPERATOR_: like
                    _VALUE_EXPRESSION_: "${searchTerm}"
                }
            }`
            ];

            // Add email condition if present
            if (state.search.includes('@')) {
                clientConditions.push(`{
                orWhere: {
                    email: null
                    _OPERATOR_: like
                    _VALUE_EXPRESSION_: "${searchTerm}"
                }
            }`);
            }

            // Property condition
            const propertyCondition = `{
            where: {
                property_name: null
                _OPERATOR_: like
                _VALUE_EXPRESSION_: "${searchTerm}"
            }
        }`;

            // Build the AND/OR group
            queryClauses.push(`{
            andWhereGroup: [
                {
                    where: {
                        Client: [
                            ${clientConditions.join(',')}
                        ]
                    }
                },
                {
                    orWhere: {
                        Property: [
                            ${propertyCondition}
                        ]
                    }
                }
            ]
        }`);
        }

        // Build GraphQL query
        const gql = `query fetchJobs($limit: IntScalar, $offset: IntScalar) {
                calcJobs(
                    query: [
                        ${queryClauses.join(',')}
                    ]
                    limit: $limit
                    offset: $offset
                    orderBy: [{ path: ["created_at"], type: ${state.sortOrder} }]
                ) {
                    id: field(arg: ["id"])
                    uniqueId: field(arg: ["unique_id"])
                    clientFirstName: field(arg: ["Client", "first_name"])
                    clientLastName: field(arg: ["Client", "last_name"])
                    clientEmail: field(arg: ["Client", "email"])
                    quoteStatus: field(arg: ["quote_status"])
                    jobStatus: field(arg: ["job_status"])
                    propertyName: field(arg: ["Property", "property_name"])
                    dateAdded: field(arg: ["created_at"]) @dateFormat(value: "MM-DD-YYYY")
                    propertyType: field(arg: ["property_type"])
                    amountInsured: field(arg: ["amount_insured"])
                    previousAmount_Insured: field(arg: ["previous_amount_insured"])
                    firstFullYearDepreciation_Estimate_Min: field(arg: ["first_full_year_depreciation_estimate_min"])
                    firstFullYearDepreciation_Estimate_Max: field(arg: ["first_full_year_depreciation_estimate_max"])
                }
            }
        `;

        // Execute query
        const res = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Api-Key": apiKey
            },
            body: JSON.stringify({
                query: gql,
                variables: {
                    limit: state.limit,
                    offset: offset
                }
            })
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

    window.addEventListener('load', () => {
        const searchInput = document.getElementById("searchInputClients");
        const searchBtn = document.getElementById("searchBtn");
        const clearBtn = document.getElementById("clearBtn");
        const suggestionContainer = document.getElementById("suggestionContainer");

        const fNameOpInput = document.querySelector('input[name="f2064//firstname"]');
        const lNameOpInput = document.querySelector('input[name="f2064//lastname"]');
        const emailOpInput = document.querySelector('input[name="f2064//email"]');
        const smsOpInput = document.querySelector('input[name="f2064//sms_number"]');
        const landlineOpInput = document.querySelector('input[name="f2064//f1532"]');
        const uniqueIdInput = document.querySelector('input[name="f2064//unique_id"]');

        const FETCH_CONTACTS_QUERY = `
        query getContacts($email: EmailScalar) {
          getContacts(
            query: [{ where: { email: $email, _OPERATOR_: like } }]
          ) {
            first_name
            last_name
            email
            sms_number
            landline_number
            unique_id
          }
        }
      `;
        function fetchContacts(emailPattern) {
            return fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": apiKey
                },
                body: JSON.stringify({
                    query: FETCH_CONTACTS_QUERY,
                    variables: { email: emailPattern }
                })
            })
                .then(function (res) { return res.json(); })
                .then(function (json) { return (json.data && json.data.getContacts) || []; });
        }

        function buildSuggestions(contacts) {
            return contacts.map(c => {
                const first = c.first_name || '';
                const last = c.last_name || '';
                const email = c.email || '';
                const sms = c.sms_number || '';
                const land = c.landline_number || '';
                const uid = c.unique_id || '';

                return `<div class="suggestion-item"
                         data-first="${first}"
                         data-last="${last}"
                         data-email="${email}"
                         data-sms="${sms}"
                         data-landline="${land}"
                         data-uid="${uid}">
                      ${first} ${last} (${email})
                    </div>`;
            }).join('');
        }

        function searchContacts() {
            var q = searchInput.value.trim();
            if (!q) {
                suggestionContainer.innerHTML = '';
                return;
            }
            suggestionContainer.innerHTML = '<div class="info-item">Searching\u2026</div>';
            fetchContacts('%' + q + '%').then(function (contacts) {
                if (contacts.length === 0) {
                    suggestionContainer.innerHTML = '<div class="info-item">No match found</div>';
                } else {
                    suggestionContainer.innerHTML = buildSuggestions(contacts);
                }
            });
        }

        searchBtn.addEventListener("click", searchContacts);
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                searchContacts();
            }
        });

        clearBtn.addEventListener("click", function () {
            searchInput.value = '';
            fNameOpInput.value = '';
            lNameOpInput.value = '';
            emailOpInput.value = '';
            smsOpInput.value = '';
            landlineOpInput.value = '';
            uniqueIdInput.value = '';
            suggestionContainer.innerHTML = '';
        });

        suggestionContainer.addEventListener('click', e => {
            const item = e.target.closest('.suggestion-item');
            if (!item) return;

            const rawFirst = item.getAttribute('data-first');
            const rawLast = item.getAttribute('data-last');

            const first = (rawFirst && rawFirst.toLowerCase() !== 'null') ? rawFirst : '';
            const last = (rawLast && rawLast.toLowerCase() !== 'null') ? rawLast : '';

            fNameOpInput.value = first;
            lNameOpInput.value = last;
            emailOpInput.value = (item.getAttribute('data-email') || '').toLowerCase() !== 'null' ? item.getAttribute('data-email') : '';
            smsOpInput.value = (item.getAttribute('data-sms') || '').toLowerCase() !== 'null' ? item.getAttribute('data-sms') : '';
            landlineOpInput.value = (item.getAttribute('data-landline') || '').toLowerCase() !== 'null' ? item.getAttribute('data-landline') : '';
            uniqueIdInput.value = (item.getAttribute('data-uid') || '').toLowerCase() !== 'null' ? item.getAttribute('data-uid') : '';

            // also fill the search bar with full name
            searchInput.value = first + (first && last ? ' ' : '') + last;

            suggestionContainer.innerHTML = '';
        });
    });

    const inputField = document.getElementById('autocomplete');
    const pacContainers = document.querySelectorAll('.pac-container');

    function showDropdown() { pacContainers.forEach(el => el.style.setProperty('display', 'block', 'important')); }
    function hideDropdown() { pacContainers.forEach(el => el.style.setProperty('display', 'none', 'important')); }

    inputField.addEventListener('focus', showDropdown);
    inputField.addEventListener('input', showDropdown);
    inputField.addEventListener('blur', () => { setTimeout(hideDropdown, 200); });

    let FETCH_PROPERTIES_QUERY = `
      query getProperty($property_name: TextScalar) {
        getProperty(
          query: [
            {
              where: {
                property_name: $property_name
                _OPERATOR_: like
              }
            }
          ]
        ) {
          Property_Name: property_name
          Unique_ID: unique_id
        }
      }
	`
        ;

    let fullAddress;
    async function fetchProperties(propertyName) {
        if (!propertyName) return [];

        try {
            const { data, errors } = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": apiKey
                },
                body: JSON.stringify({
                    query: FETCH_PROPERTIES_QUERY,
                    variables: { property_name: propertyName }
                })
            })
                .then(res => res.json());

            if (errors || !data?.getProperty) return [];

            let props = data.getProperty;
            if (!Array.isArray(props)) {
                props = [props];
            }
            return props;
        } catch (err) {
            console.error("fetchProperties error:", err);
            return [];
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const clearBtn = document.getElementById('clearBtnProperty');
        clearBtn.addEventListener('click', () => {
            document.getElementById('autocomplete').value = '';
            document.querySelector('.alreadyExists').classList.add('hidden');
            document.querySelector('.newProperty').classList.add('hidden');
            clearFields();
        });

        const autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('autocomplete'),
            { types: ['geocode'] }
        );

        autocomplete.addListener('place_changed', async () => {
            hideDropdown();
            inputField.blur();
            clearFields();

            let lotno = document.getElementById('lotNo')?.value || '';
            let unitno = document.getElementById('unitNo')?.value || '';
            let address1 = '';
            let address2 = '';
            let city = '';
            let state = '';
            let postcode = '';
            let country = '';

            const place = autocomplete.getPlace();
            place.address_components.forEach(c => {
                const types = c.types;
                if (types.includes('street_number')) address1 = c.long_name;
                else if (types.includes('route')) address1 += ' ' + c.long_name;
                else if ((types.includes('subpremise')
                    || types.includes('neighborhood')
                    || types.includes('sublocality_level_1')) && !address2) {
                    address2 = c.long_name;
                }
                else if (types.includes('locality')) city = c.long_name;
                else if (types.includes('administrative_area_level_1')) state = c.short_name;
                else if (types.includes('postal_code')) postcode = c.long_name;
                else if (types.includes('country')) country = c.long_name;
            });

            const fullAddress = `${lotno} ${unitno} ${address1} ${address2}`.trim() + `, ${city}, ${state} ${postcode}`.trim();
            const properties = await fetchProperties(fullAddress);
            const existing = properties.find(p => p.Property_Name === fullAddress);

            if (existing) {
                document.querySelector('.alreadyExists').classList.remove('hidden');
                const span = document.querySelector('.existingProperty');
                span.textContent = '';
                const link = document.createElement('a');
                link.textContent = fullAddress;
                link.href = `https://maps.google.com?q=${encodeURIComponent(fullAddress)}`;
                link.target = '_blank';
                span.appendChild(link);
                document.querySelector('.propertyuniqueid input').value = existing.Unique_ID;
                populateFields(fullAddress, city, state, postcode, country);
            } else {
                document.querySelector('.newProperty').classList.remove('hidden');
                const span = document.querySelector('.newPropertyName');
                span.textContent = '';
                const link = document.createElement('a');
                link.textContent = fullAddress;
                link.href = `https://maps.google.com?q=${encodeURIComponent(fullAddress)}`;
                link.target = '_blank';
                span.appendChild(link);
                populateFields(fullAddress, city, state, postcode, country);
            }
        });
    });

    function clearFields() {
        document.querySelector('.propertyuniqueid input').value = '';
        document.querySelector('.propertyname input').value = '';
        document.querySelector('.suburb input').value = '';
        document.querySelector('.postcode input').value = '';
        document.querySelector('.state input').value = '';
        document.querySelector('.country input').value = '';
    }

    function populateFields(fullAddress, city, state, postcode, country) {
        document.querySelector('.propertyname input').value = fullAddress;
        document.querySelector('.suburb input').value = city;
        document.querySelector('.postcode input').value = postcode;
        document.querySelector('.state input').value = state;
        document.querySelector('.country input').value = country;
    }
