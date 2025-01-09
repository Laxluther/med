from flask import Flask, render_template, request, jsonify
import openai
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Custom instructions focusing on negative effects/interactions ONLY
CUSTOM_PROMPT = """
You are a specialized medical assistant focusing on drug interactions and safety concerns.
The user will provide structured input with potential spelling errors. You must:

1. Correct minor spelling errors if present.
2. Identify any potential negative interactions or issues among:
   - Old medicines
   - Allergies
   - Old diseases
   - New medicines
   - Current conditions (e.g., pregnancy, diabetes)
   - Age, gender, blood pressure
3. Provide only an analysis of possible problems or interactions.
4. DO NOT provide treatment suggestions, next steps, or further questions.
5. Always include a disclaimer that you are NOT a doctor.

User input fields:
- Old medicines + dosage (multiple possible)
- Allergies + reaction (multiple possible)
- Old diseases (multiple possible)
- Age
- Gender
- Current conditions (e.g., pregnant, diabetes)
- Blood pressure
- New medicines + dosage (multiple possible)

Format your answer as follows:

---
1. Drug Interactions:
   [List any potential interactions among old and new medicines]

2. Allergies and Medicine Interactions:
   [List any potential interactions between allergies and medicines]

3. Disease and Medicine Interactions:
   [List any potential interactions between diseases and medicines]

4. Condition-Specific Concerns:
   [Highlight concerns related to pregnancy, diabetes, or other conditions]

5. Age/Gender/Blood Pressure-Related Issues:
   [Mention any age, gender, or blood pressure-specific concerns]

Disclaimer:
I am NOT a doctor. This analysis is for informational purposes only. Please consult a healthcare professional for medical advice.
---

User: {input}
AI:
"""

def get_medical_analysis(user_input):
    """
    Generate an analysis of potential drug interactions and safety concerns based on user input.

    :param user_input: A string containing the user's input with medical details.
    :return: A string containing the AI's analysis.
    """
    # Format the prompt with the user's input
    prompt = CUSTOM_PROMPT.format(input=user_input)
    
    # Call the OpenAI Chat Completion API
    response = openai.ChatCompletion.create(
        model="gpt-4",  # Specify the model you wish to use
        messages=[
            {"role": "system", "content": prompt}
        ],
        temperature=0.1  # Controls the creativity of the response
    )
    
    # Extract and return the AI's response
    return response.choices[0].message.content.strip()

@app.route('/')
def index():
    """
    Render the main chat interface.
    """
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Process user inputs and analyze medical data using OpenAI's API.
    """
    data = request.get_json()

    old_meds = data.get('oldMeds', [])
    allergies = data.get('allergies', [])
    age = data.get('age', '')
    gender = data.get('gender', '')
    previous_conditions = data.get('previousConditions', [])
    current_conditions = data.get('currentConditions', [])
    bp = data.get('bp', '')
    new_meds = data.get('newMeds', [])

    # Create a user-friendly message for the model
    user_message = "Here is the user data:\n"

    if old_meds:
        user_message += "Old medicines + dosage:\n"
        for med in old_meds:
            user_message += f" - {med.get('name', 'unknown')} ({med.get('dosage', 'unknown')})\n"

    if allergies:
        user_message += "Allergies:\n"
        for allergy in allergies:
            user_message += f" - {allergy.get('name', 'unknown')} (Reaction: {allergy.get('reaction', 'unknown')})\n"

    user_message += f"Age: {age}\n"
    user_message += f"Gender: {gender}\n"

    if previous_conditions:
        user_message += "Previous conditions:\n"
        for condition in previous_conditions:
            user_message += f" - {condition}\n"

    if current_conditions:
        user_message += "Current conditions:\n"
        for condition in current_conditions:
            user_message += f" - {condition}\n"

    user_message += f"Blood Pressure: {bp}\n"

    if new_meds:
        user_message += "Current prescribed medications + dosage:\n"
        for med in new_meds:
            user_message += f" - {med.get('name', 'unknown')} ({med.get('dosage', 'unknown')})\n"

    # Send user message to OpenAI's API
    bot_response = get_medical_analysis(user_message)

    return jsonify({'response': bot_response}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)