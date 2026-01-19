import React from 'react';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 prose">
            <h1>Terms of Service</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By using Ethical AI Arena, you agree to these terms. This tool is for educational and research purposes only.</p>

            <h2>2. Usage Restrictions</h2>
            <p>You may not use this tool to generate harmful, illegal, or abusive content.</p>

            <h2>3. Disclaimer</h2>
            <p>AI models can hallucinate or produce biased content. We are not responsible for the generated outputs.</p>
        </div>
    );
}
