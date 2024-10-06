import { Button } from "../components/button/Button";
import { Home, Film, ChartArea, Sprout } from "lucide-react";

export function SidebarPanel(props) {  // kind 대신 일반 함수 컴포넌트로 변경
    const { main, chart, logout, subscribe, isSidebarOpen } = props;

    return (
		<>
        <div className={`fixed h-screen inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-46 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20 lg:relative lg:translate-x-0 flex flex-col`}>
                    <div className="p-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-white text-xl font-bold">PG</span>
                    </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                        <Button variant="ghost" onClick={main} className="flex w-full justify-start items-center text-gray-800 hover:bg-green-100">
                            <Home className="mr-2 h-4 w-4" /> <span className="text-base text-center">홈</span>
                        </Button>
                        <Button variant="ghost" onClick={subscribe} className="flex w-full justify-start items-center text-gray-800 hover:bg-green-100">
                            <Sprout className="mr-2 h-4 w-4" /> <span className="text-base text-center">식물 구독</span>
                        </Button>
                        <Button variant="ghost" onClick={chart} className="flex w-full justify-start items-center text-gray-800 hover:bg-green-100">
                            <ChartArea className="mr-2 h-4 w-4" /> <span className="text-base text-center">그래프</span>
                        </Button>
                        <Button variant="ghost" className="flex w-full justify-start items-center text-gray-800 hover:bg-green-100">
                            <Film className="mr-2 h-4 w-4" /> <span className="text-base text-center">타임랩스</span>
                        </Button>
                    </div>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <Button onClick={logout} variant="ghost" className="w-full justify-start text-gray-800 hover:bg-green-100">
                            <span className="mr-2 h-4 w-4 text-base"> 로그아웃 </span>
                        </Button>
                    </div>

                </div>
		</>);
};
