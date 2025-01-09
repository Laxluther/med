// static/script.js

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const oldMedsList = document.getElementById("old-meds-list");
  const addOldMedBtn = document.getElementById("add-old-med");

  const ageSelect = document.getElementById("age-select");
  const genderSelect = document.getElementById("gender-select");

  const bpInput = document.getElementById("bp-input");

  const previousConditionsList = document.getElementById("previous-conditions-list");
  const addPreviousConditionBtn = document.getElementById("add-previous-condition");

  const currentConditionsList = document.getElementById("current-conditions-list");
  const addCurrentConditionBtn = document.getElementById("add-current-condition");

  const newMedsList = document.getElementById("new-meds-list");
  const addNewMedBtn = document.getElementById("add-new-med");

  const analyzeBtn = document.getElementById("analyze-btn");
  const resultDiv = document.getElementById("result");

  // --- DYNAMIC FIELD CREATION ---

  // Function to create a new input group with remove button
  function createInputGroup(placeholders) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("input-group");

    placeholders.forEach(placeholder => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = placeholder;
      input.required = true;
      wrapper.appendChild(input);
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.type = "button";
    removeBtn.classList.add("remove-button");

    removeBtn.addEventListener("click", () => {
      wrapper.parentElement.removeChild(wrapper);
    });

    wrapper.appendChild(removeBtn);
    return wrapper;
  }

  // Add old medication
  addOldMedBtn.addEventListener("click", () => {
    const inputGroup = createInputGroup(["Medication Name", "Dosage"]);
    oldMedsList.appendChild(inputGroup);
  });

  // Add previous condition
  addPreviousConditionBtn.addEventListener("click", () => {
    const inputGroup = createInputGroup(["Previous Condition (e.g., hypertension, diabetes)"]);
    previousConditionsList.appendChild(inputGroup);
  });

  // Add current condition
  addCurrentConditionBtn.addEventListener("click", () => {
    const inputGroup = createInputGroup(["Current Condition (e.g., flu, pregnancy)"]);
    currentConditionsList.appendChild(inputGroup);
  });

  // Add new medication
  addNewMedBtn.addEventListener("click", () => {
    const inputGroup = createInputGroup(["Medication Name", "Dosage"]);
    newMedsList.appendChild(inputGroup);
  });

  // --- COLLECT AND SEND DATA ---
  analyzeBtn.addEventListener("click", async () => {
    const oldMeds = [];
    oldMedsList.querySelectorAll(".input-group").forEach(div => {
      const inputs = div.querySelectorAll("input");
      if (inputs.length === 2) {
        const nameVal = inputs[0].value.trim();
        const dosageVal = inputs[1].value.trim();
        if (nameVal && dosageVal) {
          oldMeds.push({ name: nameVal, dosage: dosageVal });
        }
      }
    });

    const previousConditions = [];
    previousConditionsList.querySelectorAll(".input-group").forEach(div => {
      const input = div.querySelector("input");
      const val = input.value.trim();
      if (val) previousConditions.push(val);
    });

    const currentConditions = [];
    currentConditionsList.querySelectorAll(".input-group").forEach(div => {
      const input = div.querySelector("input");
      const val = input.value.trim();
      if (val) currentConditions.push(val);
    });

    const newMeds = [];
    newMedsList.querySelectorAll(".input-group").forEach(div => {
      const inputs = div.querySelectorAll("input");
      if (inputs.length === 2) {
        const nameVal = inputs[0].value.trim();
        const dosageVal = inputs[1].value.trim();
        if (nameVal && dosageVal) {
          newMeds.push({ name: nameVal, dosage: dosageVal });
        }
      }
    });

    const payload = {
      oldMeds,
      age: ageSelect.value.trim(),
      gender: genderSelect.value.trim(),
      previousConditions,
      currentConditions,
      bp: bpInput.value.trim(),
      newDisease: "",  // Removed new disease input as per prompt
      newMeds
    };

    try {
      const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        resultDiv.textContent = `Error: ${errorData.error}`;
        return;
      }

      const data = await response.json();
      resultDiv.textContent = data.response || "No response.";
    } catch (err) {
      console.error(err);
      resultDiv.textContent = `Error: ${err}`;
    }
  });
});
