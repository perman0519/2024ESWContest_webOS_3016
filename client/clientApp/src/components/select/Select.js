// onChange 핸들러 함수 정의
const handleChange = (onValueChange) => (event) => {
	onValueChange(event.target.value);
  };

export const Select = ({ onValueChange, defaultValue, children }) => {


	return (
	  <select
		onChange={handleChange(onValueChange)} // 화살표 함수 대신 핸들러 사용
		defaultValue={defaultValue}
		className="w-[300px] bg-white border border-gray-300 text-base text-gray-800 rounded px-3 py-2"
	  >
		{children}
	  </select>
	);
  };

export const SelectItem = ({ value, children }) => (
  <option className="text-base" value={value}>{children}</option>
)
