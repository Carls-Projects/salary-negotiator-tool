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
            // Using a custom message box instead of alert() for better UX
            negotiationOutput.textContent = 'Please fill in all the main text fields to generate talking points.';
            resultsDiv.classList.remove('hidden'); // Show results div to display the message
            loadingSpinner.classList.add('hidden'); // Ensure spinner is hidden
            return;
        }

        // Show loading spinner and hide previous results
        resultsDiv.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        negotiationOutput.textContent = ''; // Clear previous output
        copyToClipboardButton.classList.add('hidden'); // Hide copy button

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
    }); // This closes the generateButton.addEventListener

    copyToClipboardButton.addEventListener('click', () => {
        // Use a temporary textarea to copy formatted text including new lines
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = negotiationOutput.textContent;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        // document.execCommand('copy') is deprecated but works in iframes
        // navigator.clipboard.writeText() is the modern API but might be restricted in some iframe environments
        try {
            document.execCommand('copy');
            // Using a custom message box instead of alert()
            negotiationOutput.textContent = 'Talking points copied to clipboard!';
            resultsDiv.classList.remove('hidden'); // Show results div to display the message
        } catch (err) {
            console.error('Failed to copy text: ', err);
            negotiationOutput.textContent = 'Failed to copy text to clipboard. Please copy manually.';
            resultsDiv.classList.remove('hidden');
        } finally {
            document.body.removeChild(tempTextArea);
        }
    });
}); // This correctly closes the DOMContentLoaded event listener
