import { createContext, useState, useContext } from 'react';

const PlantContext = createContext();

export const usePlantContext = () => useContext(PlantContext);

export const PlantProvider = ({ children }) => {
  const [selectedPlantList, setSelectedPlantList] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectSectorId, setSelectSectorId] = useState("");
  const [plantAge, setPlantAge] = useState(21);
  const [plantHeight, setPlantHeight] = useState(30);

  return (
    <PlantContext.Provider
      value={{
        selectedPlantList,
        setSelectedPlantList,
        selectedPlant,
        setSelectedPlant,
		selectSectorId,
		setSelectSectorId,
		plantAge,
		setPlantAge,
		plantHeight,
		setPlantHeight
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};
