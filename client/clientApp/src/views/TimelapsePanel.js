import {useState, useEffect, useCallback} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import { Button } from '../components/button/Button';
import { Row, Cell, Column } from '@enact/ui/Layout';
import './MainPanel.style.css';
import { Card, CardContent } from "../components/card/Card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/dialog/Dialog"
import { Select, SelectItem } from "../components/select/Select"
import { SidebarPanel } from './SideBarPanel';
import css from '../App/App.module.less';

import {Film, Menu, Flower, Plus, Play, Calendar } from 'lucide-react'

const plantData = [
	{ id: 1, name: "겨자", videos: [
	  { id: 1, date: "2023-09-01", thumbnail: "/placeholder.svg?height=120&width=200" },
	  { id: 2, date: "2023-09-15", thumbnail: "/placeholder.svg?height=120&width=200" },
	  { id: 3, date: "2023-09-30", thumbnail: "/placeholder.svg?height=120&width=200" },
	]},
	{ id: 2, name: "바질", videos: [
	  { id: 4, date: "2023-09-05", thumbnail: "/placeholder.svg?height=120&width=200" },
	  { id: 5, date: "2023-09-20", thumbnail: "/placeholder.svg?height=120&width=200" },
	]},
	{ id: 3, name: "로즈마리", videos: [
	  { id: 6, date: "2023-09-10", thumbnail: "/placeholder.svg?height=120&width=200" },
	  { id: 7, date: "2023-09-25", thumbnail: "/placeholder.svg?height=120&width=200" },
	]},
  ]

const ip = "10.19.233.90:8081";

async function setPlantList(user) {
    const getSubListRes = await fetch(`http://${ip}/api/sub-list/${user.uid}`);
    console.log(getSubListRes);
    const res = await getSubListRes.json();
    console.log(res);
    return res;
}

async function initSelectedPlant(selectedPlantList) {
    if (!selectedPlantList || selectedPlantList.length === 0) {
        return null;
    }
    const selectRes = await fetch(`http://${ip}/api/sector/${selectedPlantList[0].id}`);
    if (!selectRes.ok) {
        throw new Error('Failed to fetch plant details');
    }
    const select = await selectRes.json();
    return select;
}

function TimelapsePanel(props) {
    const { main, chart, user, subscribe, logout, timelapse } = props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPlantList, setSelectedPlantList] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectSectorId, setSelectSectorId] = useState("");
    const [src, setSrc] = useState("");
    const [camerror, setCameraError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
    const [firebseError, setFirebseError] = useState(null);


    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setFirebseError(null);
            try {
                const plantList = await setPlantList(user);
                if (!plantList.length) {
                    subscribe();
                }
                setSelectedPlantList(plantList);
                setSelectSectorId(plantList[0].id);
                if (plantList.length > 0) {
                    const plant = await initSelectedPlant(plantList);
                    setSelectedPlant(plant);
                } else {
                    setFirebseError("No plants found for this user");
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setFirebseError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        if (user && user.uid) {
            fetchData();
        }
    }, [user]);

    const handleSelectedPlant = useCallback(async (value) => {
        console.log(value);
        const vlist = value.split('-');
        setSelectSectorId(vlist[0]);
    }, []);

	const handleError = useCallback(() => {
        setCameraError(true);
    }, []);

	const handleVideo = useCallback(() => {
		setSrc(`http://${ip}/timelapse`);
		setCameraError(false); // 에러 상태 초기화
	}, []);

    return (
        <Panel css={css} className='custom-panel' noBackButton noCloseButton {...props}>
            {/* <Header title="COSMOS IoT Dashboard" /> */}
            <Row className="flex h-screen bg-gradient-to-br from-green-100 to-green-200 text-gray-800 overflow-hidden" style={{height: '100%', width: '100%'}}>
                <Cell size="12%">
                    <SidebarPanel main={main} chart={chart} logout={logout} subscribe={subscribe} timelapse={timelapse}  isSidebarOpen={isSidebarOpen}/>
                </Cell>
                <Cell className="flex-1 overflow-hidden">
                    <Column className="h-full overflow-y-auto p-2">
                        <Cell size={100} component="header" className="flex justify-between items-center mt-2 mb-6">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" className="md:hidden text-gray-800" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    <Menu className="h-6 w-6" />
                                </Button>
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <Film className="text-white" size={24} />
                                </div>
                                <div>
                                <h1 className="text-2xl font-bold text-gray-800">타임랩스 영상</h1>
                                    <p className="text-gray-600">식물의 성장 과정을 타임랩스로 확인하세요</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {
                                    selectedPlant &&
                                    <Select className=""  onValueChange={handleSelectedPlant} defaultValue={selectedPlant.plant.name}>
                                    	{selectedPlantList && selectedPlantList.map((plant) => <SelectItem value={plant.id+"-"+plant.name}>{plant.name}</SelectItem>)}
                                	</Select>
                                }
                            </div>
                       </Cell>
                       <Cell className="grid grid-cols-16 gap-3">
                            <Card className="bg-white  w-full border-gray-200">
                                <CardContent className="p-6  w-full flex flex-col items-center">
                                <div className="rounded-lg w-full flex items-center justify-center mb-4">
                                    {!camerror && (
                                    <img
                                        src={src}
                                        width="940"
                                        height="600"
                                        onError={handleError}
                                        alt="Streaming Content"
                                    />
                                    )}
                                    {camerror && <div className="bg-gray-200 w-full h-80 p-4 rounded text-center text-gray-500">식물 타임랩스</div>}
                                </div>
                                <div className="flex justify-center w-full">
                                    <Button variant="primary" className="w-fit" onClick={handleVideo}>
                                    재생하기
                                    </Button>
                                </div>
                                </CardContent>
                            </Card>
                       </Cell>
                    </Column>
                </Cell>
            </Row>
        </Panel>
    );
}

export default TimelapsePanel;
