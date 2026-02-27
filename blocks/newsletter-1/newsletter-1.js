export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length < 3) return;

  // Extract data from rows
  const [headerRow, dropdown1Row, dropdown2Row, footerRow] = rows;

  // Get title and description from first row
  const [titleCell, descriptionCell] = headerRow.children;
  const title = titleCell?.textContent.trim() || 'Sign up to our newsletter-1';
  const description = descriptionCell?.textContent.trim() || '';

  // Get dropdown 1 data from second row
  const [dropdown1LabelCell, dropdown1OptionsCell] = dropdown1Row.children;
  const dropdown1Label = dropdown1LabelCell?.textContent.trim() || 'Where do you live?';
  const dropdown1Options = dropdown1OptionsCell?.textContent.trim().split(',').map((opt) => opt.trim()).filter((opt) => opt) || [];

  // Get dropdown 2 data from third row
  const [dropdown2LabelCell, dropdown2OptionsCell] = dropdown2Row.children;
  const dropdown2Label = dropdown2LabelCell?.textContent.trim() || 'Why did you decide to visit us today?';
  const dropdown2Options = dropdown2OptionsCell?.textContent.trim().split(',').map((opt) => opt.trim()).filter((opt) => opt) || [];

  // Get privacy text and button text from fourth row
  const [privacyCell, buttonTextCell] = footerRow?.children || [];
  const buttonText = buttonTextCell?.textContent.trim() || 'Sign Up';

  // Create inner content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'newsletter-1-content';

  // Create row div
  const row = document.createElement('div');
  row.className = 'newsletter-1-row';

  // Create title
  const titleDiv = document.createElement('div');
  titleDiv.className = 'newsletter-1-title';
  titleDiv.textContent = title;
  row.appendChild(titleDiv);

  // Create description
  const descriptionDiv = document.createElement('div');
  descriptionDiv.className = 'newsletter-1-description';
  descriptionDiv.textContent = description;
  row.appendChild(descriptionDiv);

  // Create form wrapper
  const formWrapper = document.createElement('div');
  formWrapper.className = 'newsletter-1-form-wrapper';

  // Create form
  const form = document.createElement('form');
  form.className = 'newsletter-1-form';

  // Create input wrapper
  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'newsletter-1-input-wrapper';

  // Create email input
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.className = 'newsletter-1-input';
  emailInput.placeholder = 'Enter your email';
  emailInput.required = true;
  emailInput.setAttribute('aria-label', 'Email address');

  inputWrapper.appendChild(emailInput);
  form.appendChild(inputWrapper);

  // Create expanded fields container (hidden by default)
  const expandedFields = document.createElement('div');
  expandedFields.className = 'newsletter-1-expanded-fields';

  // Create first dropdown
  const dropdown1Wrapper = document.createElement('div');
  dropdown1Wrapper.className = 'newsletter-1-field-wrapper';

  const dropdown1LabelEl = document.createElement('label');
  dropdown1LabelEl.textContent = dropdown1Label;
  dropdown1LabelEl.className = 'newsletter-1-field-label';

  const dropdown1Select = document.createElement('select');
  dropdown1Select.className = 'newsletter-1-select';
  dropdown1Select.required = true;

  const dropdown1Placeholder = document.createElement('option');
  dropdown1Placeholder.value = '';
  dropdown1Placeholder.textContent = 'Please select...';
  dropdown1Placeholder.disabled = true;
  dropdown1Placeholder.selected = true;
  dropdown1Select.appendChild(dropdown1Placeholder);

  dropdown1Options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    dropdown1Select.appendChild(option);
  });

  dropdown1Wrapper.appendChild(dropdown1LabelEl);
  dropdown1Wrapper.appendChild(dropdown1Select);
  expandedFields.appendChild(dropdown1Wrapper);

  // Create second dropdown
  const dropdown2Wrapper = document.createElement('div');
  dropdown2Wrapper.className = 'newsletter-1-field-wrapper';

  const dropdown2LabelEl = document.createElement('label');
  dropdown2LabelEl.textContent = dropdown2Label;
  dropdown2LabelEl.className = 'newsletter-1-field-label';

  const dropdown2Select = document.createElement('select');
  dropdown2Select.className = 'newsletter-1-select';
  dropdown2Select.required = true;

  const dropdown2Placeholder = document.createElement('option');
  dropdown2Placeholder.value = '';
  dropdown2Placeholder.textContent = 'Please select...';
  dropdown2Placeholder.disabled = true;
  dropdown2Placeholder.selected = true;
  dropdown2Select.appendChild(dropdown2Placeholder);

  dropdown2Options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    dropdown2Select.appendChild(option);
  });

  dropdown2Wrapper.appendChild(dropdown2LabelEl);
  dropdown2Wrapper.appendChild(dropdown2Select);
  expandedFields.appendChild(dropdown2Wrapper);

  form.appendChild(expandedFields);

  // Create submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'newsletter-1-button';
  submitButton.textContent = buttonText;

  form.appendChild(submitButton);
  formWrapper.appendChild(form);
  row.appendChild(formWrapper);

  // Add expand/collapse behavior
  emailInput.addEventListener('focus', () => {
    form.classList.add('expanded');

    // Add ripple effect
    inputWrapper.classList.add('ripple');
    setTimeout(() => {
      inputWrapper.classList.remove('ripple');
    }, 600);
  });

  // Click outside to collapse form
  const collapseForm = (event) => {
    // Check if click is outside the form
    if (form.classList.contains('expanded') && !form.contains(event.target)) {
      form.classList.remove('expanded');
    }
  };

  // Add click listener to document
  document.addEventListener('click', collapseForm);

  // Cleanup function to remove listener when block is removed (optional but good practice)
  // Store reference in case needed for cleanup
  block.dataset.hasClickListener = 'true';

  // Add sparkle effect when dropdowns are completed
  const addSparkleEffect = (selectElement) => {
    selectElement.classList.add('completed');
    setTimeout(() => {
      selectElement.classList.remove('completed');
    }, 600);
  };

  dropdown1Select.addEventListener('change', () => {
    if (dropdown1Select.value) {
      addSparkleEffect(dropdown1Select);
    }
  });

  dropdown2Select.addEventListener('change', () => {
    if (dropdown2Select.value) {
      addSparkleEffect(dropdown2Select);
    }
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const dropdown1Value = dropdown1Select.value;
    const dropdown2Value = dropdown2Select.value;

    // Add your newsletter-1 signup logic here
    // TODO: Implement newsletter-1 signup API call
    if (email && dropdown1Value && dropdown2Value) {
      // Show success animation
      submitButton.classList.add('success');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Success!';

      // Reset form after success animation
      setTimeout(() => {
        emailInput.value = '';
        dropdown1Select.selectedIndex = 0;
        dropdown2Select.selectedIndex = 0;
        form.classList.remove('expanded');
        submitButton.classList.remove('success');
        submitButton.textContent = originalText;
      }, 2000);
    }
  });

  // Create privacy text
  if (privacyCell) {
    const privacyDiv = document.createElement('div');
    privacyDiv.className = 'newsletter-1-privacy';
    privacyDiv.innerHTML = privacyCell.innerHTML;
    row.appendChild(privacyDiv);
  }

  contentWrapper.appendChild(row);
  block.textContent = '';
  block.appendChild(contentWrapper);
}
