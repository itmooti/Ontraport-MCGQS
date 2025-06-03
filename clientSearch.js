  let formToggler = document.querySelectorAll(".formToggler");
  let testForm = document.querySelector(".testForm");
  let customOverlay = document.querySelector(".customOverlay");
  let formClose = document.querySelector(".formClose");

   function showForm() {
        testForm?.classList.remove("!translate-x-full"); //hidden initially
        customOverlay?.classList.remove("hidden");
    }
    function hideForm() {
        testForm?.classList.add("!translate-x-full"); //hidden initially
        customOverlay?.classList.add("hidden");
    }

    if (formToggler.length > 0) {
        formToggler.forEach((btn) => btn.addEventListener("click", showForm));
    }

    formClose?.addEventListener("click", hideForm);
        
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
