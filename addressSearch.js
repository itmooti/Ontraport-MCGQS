const inputField = document.getElementById('autocomplete');
const pacContainers = document.querySelectorAll('.pac-container');
function showDropdown() {pacContainers.forEach(el => el.style.setProperty('display', 'block', 'important'));}
function hideDropdown() {pacContainers.forEach(el => el.style.setProperty('display', 'none', 'important'));}
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
`;
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
        }).then(res => res.json());

        if (errors || !data?.getProperty) return [];
        let props = data.getProperty;
        if (!Array.isArray(props)) props = [props];
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
        clearFields();
    });

    const autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
            types: ['geocode'],
            componentRestrictions: { country: 'au' }
        }
    );

    autocomplete.addListener('place_changed', async () => {
        hideDropdown();
        inputField.blur();
        clearFields();

        const lotno = document.getElementById('lotNo')?.value || '';
        let unitno = document.getElementById('unitNo')?.value || '';
        let address1 = '';
        let city = '';
        let state = '';
        let postcode = '';
        let country = '';

        const place = autocomplete.getPlace();
        place.address_components.forEach(c => {
            const types = c.types;
            if (types.includes('street_number')) {
                address1 = c.long_name;
            } else if (types.includes('route')) {
                address1 += ` ${c.long_name}`;
            } else if (
                types.includes('subpremise')
            ) {
                // Use subpremise (e.g., Unit/Apartment) as unit number if not provided
                if (!unitno) unitno = c.long_name;
            } else if (types.includes('locality')) {
                city = c.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                state = c.short_name;
            } else if (types.includes('postal_code')) {
                postcode = c.long_name;
            } else if (types.includes('country')) {
                country = c.long_name;
            }
        });

        const fullAddress = [
            lotno,
            unitno,
            address1
        ].filter(Boolean).join(' ') + `, ${city}, ${state} ${postcode}`;

        const properties = await fetchProperties(fullAddress);
        const existing = properties.find(p => p.Property_Name === fullAddress);


        if (existing) {
            document.querySelector('.propertyuniqueid input').value = existing.Unique_ID;
        }

        populateFields({
            lotno,
            unitno,
            address1,
            city,
            state,
            postcode,
            country,
            fullAddress
        });
    });
    const searchDiv = document.querySelector('.searchDiv');
    const customSearchWrapper = searchDiv.querySelector('.customSearchWrapper');

    setTimeout(() => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer && customSearchWrapper) {
            customSearchWrapper.appendChild(pacContainer);
        }
    }, 300);

});

function clearFields() {
    document.querySelector('.propertyuniqueid input').value = '';
    document.getElementById('autocomplete').value = '';
    document.querySelector('.unit input').value = '';
    document.querySelector('.address1 input').value = '';
    document.querySelector('.propertyname input').value = '';
    document.querySelector('.suburb input').value = '';
    document.querySelector('.postcode input').value = '';
    document.querySelector('.state input').value = '';
    document.querySelector('.country input').value = '';
}

function populateFields({
    lotno,
    unitno,
    address1,
    city,
    state,
    postcode,
    country,
    fullAddress
}) {
    document.querySelector('.propertyname input').value = fullAddress;
    document.querySelector('.unit input').value = unitno
        ? unitno + (lotno ? '/' + lotno : '')
        : lotno;
    document.querySelector('.address1 input').value = address1;
    document.querySelector('.suburb input').value = city;
    document.querySelector('.postcode input').value = postcode;
    document.querySelector('.state input').value = state;
    document.querySelector('.country input').value = country;
}
