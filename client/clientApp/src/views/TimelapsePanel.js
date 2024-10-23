import {useState, useCallback} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import { Button } from '../components/button/Button';
import { Row, Cell, Column } from '@enact/ui/Layout';
import './MainPanel.style.css';
import { Card, CardContent } from "../components/card/Card"
import { Select, SelectItem } from "../components/select/Select"
import { SidebarPanel } from './SideBarPanel';
import css from '../App/App.module.less';
import { usePlantContext } from './PlantContext.js';

import {Film, Menu} from 'lucide-react'

import dotenv from 'dotenv';

dotenv.config();

const ip = `${process.env.REACT_APP_IP}:${process.env.REACT_APP_HTTP_PORT}`;

function TimelapsePanel(props) {
    // eslint-disable-next-line
    const { main, chart, user, subscribe, logout, timelapse } = props;
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [src, setSrc] = useState("");
    const [camerror, setCameraError] = useState(false);
    const {
        selectedPlantList,
        selectedPlant,
        setSelectSectorId,
    } = usePlantContext();  // Context에서 상태 가져오기

    const handleSelectedPlant = useCallback(async (value) => {
        console.log(value);
        const vlist = value.split('-');
        setSelectSectorId(vlist[0]);
    }, [setSelectSectorId]);

	const handleError = useCallback(() => {
        setCameraError(true);
    }, []);

     // 비디오 요청 시 Range 헤더를 추가하여 요청하는 함수
	const handleVideo = useCallback(async () => {
        console.log("handleVideo");

        try {
            const response = await fetch(`http://${ip}/timelapse`, {
                headers: {
                    'Range': 'bytes=0-1048576' // 1MB 범위 지정 (필요에 따라 변경 가능)
                }
            });

            if (response.ok) {
                const videoBlob = await response.blob();
                const videoURL = URL.createObjectURL(videoBlob);
                setSrc(videoURL);  // 비디오 URL을 설정
                setCameraError(false);  // 에러 상태 초기화
            } else {
                console.error("Failed to load video");
                setCameraError(true);
            }
        } catch (error) {
            console.error("Error fetching video:", error);
            setCameraError(true);
        }
	}, [ip]);

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
                                     {/* Display video from the server */}
                                    {!camerror && (
                                        <video id="videoPlayer" src="http://10.19.208.172:3005/video" controls width="640" height="360" onError={handleError}></video>
                                    )}
                                    {camerror && <div className="bg-gray-200 w-full h-80 p-4 rounded text-center text-gray-500">식물 타임랩스</div>}
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
