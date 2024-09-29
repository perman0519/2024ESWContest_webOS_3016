import numpy as np
import pandas as pd
import joblib

# Load the trained regression model
model = joblib.load('regression_model.pkl')

# Create a numpy array with the plant's feature data
온도 = 21  # Input actual value
습도 = 32  # Input actual value
일조량 = 6  # Input actual value

# Create data for prediction
features = pd.DataFrame([[온도, 습도, 일조량]], columns=['온도', '습도', '일조량'])

# Predict the amount of water to be given
predicted_water_amount = model.predict(features)

# Print the predicted amount of water
print(predicted_water_amount[0])