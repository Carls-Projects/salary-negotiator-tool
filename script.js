document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOMContentLoaded fired! Script is running.'); // Uncomment for debugging

    // Correctly reference the HTML elements by their exact IDs
    const offerDetailsInput = document.getElementById('offerDetails');
    const targetGoalInput = document.getElementById('targetGoal');
    const justificationPointsInput = document.getElementById('justificationPoints');
    const negotiationContextInput = document.getElementById('negotiationContext');
    const generateButton = document.getElementById('generateButton');
    const resultsDiv = document.getElementById('results');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const negotiationOutput = document.getElementById('negotiationOutput');
    const copyToClipboardButton = document.getElementById('copyToClipboard');
    const monetizationLink = document.getElementById('monetizationLink');

    // Select all checkboxes for non-salary priorities
    const priorityCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');


    // Placeholder for your actual monetization link
    monetizationLink.href = 'https://yourwebsite.com/premium-services'; // *** REMEMBER TO REPLACE THIS WITH YOUR ACTUAL LINK ***

    generateButton.addEventListener('click', async () => {
        const offerDetails = offerDetailsInput.value.trim();
        const targetGoal = targetGoalInput.value.trim();
        const justificationPoints = justificationPointsInput.value.trim();
        const negotiationContext = negotiationContextInput.value.trim();

        // Collect selected non-salary priorities
        const selectedPriorities = Array.from(priorityCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Basic validation for negotiation fields (non-salary priorities are optional)
        if (!offerDetails || !targetGoal || !justificationPoints || !negotiationContext) {
            alert('Please fill in all the main text fields to generate talking points.');
            return;
        }

        // Show loading spinner and hide previous results
        resultsDiv.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        negotiationOutput.textContent = ''; // Clear previous output
        copyToClipboardButton.classList.add('hidden'); // Hide copy button

        try {// Inside script.js, within the generateButton.addEventListener('click', async () => { ... }
try {
    // Make an API call to your Vercel serverless function
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Send all the collected data from the form
        body: JSON.stringify({
            offerDetails,
            targetGoal,
            justificationPoints,
            negotiationContext,
            selectedPriorities // This sends your new checkbox data
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    negotiationOutput.textContent = data.talkingPoints; // Display AI's generated points

    resultsDiv.classList.remove('hidden'); // Show results div
    copyToClipboardButton.classList.remove('hidden'); // Show copy button

} catch (error) {
    console.error('Error during generation:', error);
    // Display a user-friendly error message
    negotiationOutput.textContent = `Error generating talking points: ${error.message}. Please check your inputs and try again.`;
    resultsDiv.classList.remove('hidden');
} finally {
    loadingSpinner.classList.add('hidden'); // Hide spinner
}
Here are some simulated talking points for your negotiation:

**Opening:**
"Thank you so much for the generous offer for the ${offerDetails.split(',')[0].trim()} role. I'm incredibly excited about the opportunity to join your team and contribute to [mention something specific about company/role if you have it, e.g., 'your innovative projects']."

**Core Salary/Goal Justification:**
"Based on my deep experience in [mention key skill from justification] and my recent achievement of [mention key achievement from justification, e.g., 'exceeding sales targets by 20%'], I believe a base salary of ${targetGoal.split(' ')[0].trim()} aligns more closely with my market value and the significant impact I can bring to this role."

` + (selectedPriorities.length > 0 ? `
**Non-Salary Priorities:**
"Beyond base compensation, I'm also very interested in discussing ${selectedPriorities.join(', ')}. For instance, [choose one priority, e.g., 'more PTO'] would allow me to [explain benefit, e.g., 'return refreshed and highly productive'], which ultimately benefits the company as well."

` : '') + `
**Anticipating Objections & Responses:**
* **If they mention budget:** "I understand budgets are tight, but considering my proven ability to [reiterate a key justification point], I'm confident that this investment would yield a strong ROI for your team."
* **If they say 'standard package':** "I appreciate that, and I'm very happy with many aspects of the standard package. However, given [reiterate unique skill/value], I believe there's room to tailor the offer slightly to ensure I can hit the ground running with maximum motivation."

**Confident Closing & Next Steps:**
"I'm truly excited about this opportunity and committed to finding a mutually beneficial compensation package. What are your thoughts on this, and what are the next steps?"

**Overall Tone Recommendation:** Aim for a **confident, collaborative, and enthusiastic** tone throughout the conversation. You're not making demands, but proposing a partnership.
            `;

            negotiationOutput.textContent = dummyOutput; // Set dummy output
            resultsDiv.classList.remove('hidden'); // Show results div
            copyToClipboardButton.classList.remove('hidden'); // Show copy button

        } catch (error) {
            console.error('Error during generation:', error);
            negotiationOutput.textContent = 'Error generating talking points. Please try again.';
            resultsDiv.classList.remove('hidden');
        } finally {
            loadingSpinner.classList.add('hidden'); // Hide spinner
        }
    });

    copyToClipboardButton.addEventListener('click', () => {
        // Use a temporary textarea to copy formatted text including new lines
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = negotiationOutput.textContent;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy'); // Note: execCommand is deprecated, but widely supported for now
        document.body.removeChild(tempTextArea);
        alert('Talking points copied to clipboard!');
    });
});