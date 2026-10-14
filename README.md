Pulseboard Cardiac AI - Real-Time Risk & Explainability

A real-time cardiac disease risk prediction dashboard powered by Kafka streaming, the UCI Cleveland Random Forest model, and individual patient SHAP and LIME explainability.

##  Application Features
- **Holdout Test Evaluation**: Real-time validation metrics on 184 test records from the UCI Cleveland dataset.
- **AI Explainability**: Dual SHAP feature attribution waterfall and LIME local decision rules for every patient.
- **Interpretable Clinical Reports**: Generates printable physician reports detailing risk drivers, vitals, and findings.
- **IoT Patient Vital Stream**: Kafka topic partition stream monitor with live vitals and telemetry event logs.
- **Live Patient Monitoring**: Real-time multi-patient status, sorting, and vital sign tracking.
