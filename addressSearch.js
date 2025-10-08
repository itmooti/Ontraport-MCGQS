
const inputField = document.getElementById('autocomplete');

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

// ========== Utility: Safe Fetch ==========
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

// ========== Dropdown Helpers ==========
function showDropdown() {
  document.querySelectorAll('.pac-container').forEach(el =>
    el.style.setProperty('display', 'block', 'important')
  );
}

function hideDropdown() {
  document.querySelectorAll('.pac-container').forEach(el =>
    el.style.setProperty('display', 'none', 'important')
  );
}

// ========== Field Helpers ==========
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
  streetNumber,
  city,
  state,
  postcode,
  country,
  fullAddress
}) {
  document.querySelector('.propertyname input').value = fullAddress;
  const unitParts = [];
  if (unitno) unitParts.push(unitno);
  if (lotno) unitParts.push(lotno);
  if (streetNumber) unitParts.push(streetNumber);
  document.querySelector('.unit input').value = unitParts.join('/');
  document.querySelector('.address1 input').value = address1;
  document.querySelector('.suburb input').value = city;
  document.querySelector('.postcode input').value = postcode;
  document.querySelector('.state input').value = state;
  document.querySelector('.country input').value = country;
}

// ========== Wait for Google PAC Container ==========
function waitForPacContainer(callback) {
  const interval = setInterval(() => {
    const pacContainer = document.querySelector('.pac-container');
    if (pacContainer) {
      clearInterval(interval);
      callback(pacContainer);
    }
  }, 100);
}

// ========== Main Initialization ==========
document.addEventListener('DOMContentLoaded', function () {
  const clearBtn = document.getElementById('clearBtnProperty');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.getElementById('autocomplete').value = '';
      clearFields();
    });
  }

  // Initialize Google Autocomplete
  const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete'),
    {
      types: ['geocode'],
      componentRestrictions: { country: 'au' }
    }
  );

  let lastSearch = ''; // prevent stale async results

  autocomplete.addListener('place_changed', async () => {
    hideDropdown();
    inputField.blur();
    clearFields();

    const place = autocomplete.getPlace();
    if (!place || !place.address_components) return; // safety guard

    const lotno = document.getElementById('lotNo')?.value || '';
    let unitno = document.getElementById('unitNo')?.value || '';
    let address1 = '';
    let streetNumber = '';
    let city = '';
    let state = '';
    let postcode = '';
    let country = '';

    place.address_components.forEach(c => {
      const types = c.types;
      if (types.includes('street_number')) {
        streetNumber = c.long_name;
      } else if (types.includes('route')) {
        address1 = c.long_name;
      } else if (types.includes('subpremise')) {
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
      streetNumber,
      address1
    ].filter(Boolean).join(' ') + `, ${city}, ${state} ${postcode}`;

    lastSearch = fullAddress;

    const properties = await fetchProperties(fullAddress);
    if (fullAddress !== lastSearch) return; // stale result guard

    const existing = properties.find(p => p.Property_Name === fullAddress);
    if (existing) {
      document.querySelector('.propertyuniqueid input').value = existing.Unique_ID;
    }

    populateFields({
      lotno,
      unitno,
      address1,
      streetNumber,
      city,
      state,
      postcode,
      country,
      fullAddress
    });
  });

  // Move Google PAC dropdown inside your custom wrapper
  const searchDiv = document.querySelector('.searchDiv');
  const customSearchWrapper = searchDiv?.querySelector('.customSearchWrapper');
  if (customSearchWrapper) {
    waitForPacContainer(pacContainer => {
      customSearchWrapper.appendChild(pacContainer);
    });
  }
});
