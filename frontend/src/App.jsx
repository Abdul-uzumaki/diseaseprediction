import React, { useState } from "react";
import './styles/App.css';
import { symptomsByBody } from "./symptomsByBody";
import diseasesInfo from "./diseases";

export default function App() {
  const [step, setStep] = useState(1); // Step control
  const [symptoms, setSymptoms] = useState({});
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const toggle = (symptom) =>
    setSymptoms((prev) => ({ ...prev, [symptom]: prev[symptom] ? 0 : 1 }));

  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !age || !gender) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { ...symptoms, age: Number(age), gender: gender.toLowerCase() };
      const res = await fetch("https://diseaseprediction-steel.vercel.app/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      const disease = data.predicted_disease || "No disease predicted";
      const details = diseasesInfo[disease] || {
        description: "No extra details available.",
        precautions: ["Consult a doctor"],
      };

      setStep(3);

      // Open report
      const reportWindow = window.open("", "_blank");
      reportWindow.document.write(`
        <html>
          <head>
            <title>Disease Report</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Poppins', sans-serif;
                background: linear-gradient(135deg, #87CEFA, #98FB98);
                margin: 0;
                padding: 40px;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .container {
                width: 90%;
                max-width: 900px;
                background: rgba(255,255,255,0.2);
                backdrop-filter: blur(20px);
                border-radius: 25px;
                padding: 30px 40px;
                box-shadow: 0 15px 40px rgba(0,0,0,0.2);
              }
              h1 { text-align: center; color: #004d40; margin-bottom: 25px; }
              h2 { color: #00796b; margin-bottom: 12px; margin-top: 20px; }
              p, li { color: #004d40; line-height: 1.6; }
              ul { padding-left: 20px; }
              li { margin-bottom: 8px; }
              .btn-download {
                display: block;
                text-align: center;
                padding: 12px;
                margin-top: 25px;
                background: #00bcd4;
                color: #fff;
                border-radius: 20px;
                font-weight: 600;
                text-decoration: none;
                transition: 0.3s;
              }
              .btn-download:hover { background: #00796b; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="container" id="report">
              <h1>Disease Prediction Report</h1>
              <h2>User Info</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Age:</strong> ${age}</p>
              <p><strong>Gender:</strong> ${gender}</p>

              <h2>Prediction</h2>
              <p><strong>Disease:</strong> ${disease}</p>
              <p><strong>Description:</strong> ${details.description}</p>

              <h2>Precautions</h2>
              <ul>${details.precautions.map(p => `<li>${p}</li>`).join("")}</ul>

              <a href="#" class="btn-download" id="downloadBtn">Download as PDF</a>
            </div>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <script>
              document.getElementById('downloadBtn').addEventListener('click', function() {
                const element = document.getElementById('report');
                html2pdf().from(element).save('${name}_Disease_Report.pdf');
              });
            </script>
          </body>
        </html>
      `);
      reportWindow.document.close();
    } catch (err) {
      setError("Prediction failed. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="card">
        {step === 1 && (
          <>
            <h1>Disease-Predictor</h1>
            <form onSubmit={handleUserInfoSubmit}>
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="input-field" />
              <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" />
              <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className="input-field" />
              <select value={gender} onChange={e => setGender(e.target.value)} className="input-field">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" className="btn-primary">Next</button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Select Symptoms</h1>
            <input type="text" placeholder="Search symptoms..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field" />
            <form onSubmit={handleSubmit}>
              {Object.entries(symptomsByBody).map(([body, arr]) => {
                const filtered = arr.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
                if (!filtered.length) return null;
                return (
                  <div key={body} className="body-section">
                    <h2>{body}</h2>
                    <div className="chip-grid">
                      {filtered.map(sym => (
                        <div key={sym} onClick={() => toggle(sym)} className={`chip ${symptoms[sym] ? "selected" : ""}`}>
                          {sym.replace(/_/g, " ")}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button type="submit" className="btn-primary">{loading ? "Predicting..." : "Predict Disease"}</button>
            </form>
          </>
        )}

        {step === 3 && (
          <div>
            <h1>Prediction Completed 🎉</h1>
            <p>Your report has been generated in a new tab. Please check it.</p>
            <button onClick={() => setStep(1)} className="btn-primary">Start Again</button>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}
         <p className="disclaimer">
          Disclaimer: This web app does not provide 100% accurate results.  
          It only suggests <strong>possible diseases</strong> based on entered symptoms.  
          Always consult a qualified doctor for medical advice.
          </p>
      </div>
    </div>
  );
}
