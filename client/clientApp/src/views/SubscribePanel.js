import {useState, useEffect, useCallback} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import { Button } from '../components/button/Button';
import { Row, Cell, Column } from '@enact/ui/Layout';
import './MainPanel.style.css';
import { Card, CardContent } from "../components/card/Card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/dialog/Dialog"
import { Select, SelectItem } from "../components/select/Select"
import {Calendar, Flower, Plus } from 'lucide-react'
import { SidebarPanel } from './SideBarPanel';
import css from '../App/App.module.less';

const ip = "10.19.233.90:8081";

function SubscribePanel(props) {
    const { main, chart, user, subscribe, logout, timelapse, isSidebarOpen } = props;
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newSubscriptionPlant, setNewSubscriptionPlant] = useState("");
    const [subscriptionSlots, setSubscriptionSlots] = useState([]);
    const [slots, setSlots] = useState();

    useEffect( () => {
        async function fetchData() {
            const response = await fetch(`http://${ip}/api/sectors`);
            const data = await response.json();
            console.log(data);
            let n = 0;
            const sectors = await data.map((slot) => {
                return {
                    id: n++,
                    name: slot.plant.name,
                    subscriber: slot.uid,
                    startDate: slot.plant.createdAt,
                }
            });
            console.log("sectors: ", sectors);
            setSubscriptionSlots(sectors);
            setSlots(sectors);
        }
        fetchData();
    }, []);

    const handleSlotClick = (slot) => {
      setSelectedSlot(slot);
      setIsDialogOpen(true);
    }

    const handleNewSubscription = () => {
      if (selectedSlot && newSubscriptionPlant) {
        const today = new Date().toISOString().split('T')[0];
        const updatedSlots = slots.map(slot =>
          slot.id === selectedSlot.id
            ? { ...slot, name: newSubscriptionPlant, subscriber: [...slot.subscriber, `${user.uid}`], startDate: today }
            : slot
        )
        console.log(selectedSlot.id);
        fetch(`http://${ip}/api/sector/${selectedSlot.id}`, {
            method: 'PATCH', // 메소드 설정
            headers: {
              'Content-Type': 'application/json', // 요청의 Content-Type을 JSON으로 설정
            },
            body: JSON.stringify({
                "uid": `${user.uid}`,
                "plant": {
                    "name": `${newSubscriptionPlant}`,
                    "createdAt": `${today}`,
                    "length": {
                        [today] : 0
                    }
                }
            }), // 전송할 데이터를 JSON 형태로 변환
          })
            .then(response => response.json())
            .then(data => {
              console.log('Success:', data);
            })
            .catch(error => {
              console.error('Error:', error);
            });

        setSlots(updatedSlots);
        setIsDialogOpen(false);
        setNewSubscriptionPlant("")
      }
    }

    return (
        <Panel css={css} className='custom-panel' noBackButton noCloseButton {...props}>
            {/* <Header title="COSMOS IoT Dashboard" /> */}
            <Row className="flex h-screen bg-gradient-to-br from-green-100 to-green-200 text-gray-800 overflow-hidden" style={{height: '100%', width: '100%'}}>
                <Cell size="12%">
                    <SidebarPanel main={main} chart={chart} logout={logout} subscribe={subscribe} timelapse={timelapse} isSidebarOpen={isSidebarOpen}/>
                </Cell>
                <Cell className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 p-8">
                    <Column className="max-w-6xl mx-auto">
                        <div className="flex items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 ml-4">식물 구독</h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {slots && slots.map((slot) => (
                                <Card
                                key={slot.id}
                                className={`${slot.name ? 'bg-green-100' : 'bg-white'} hover:bg-green-200 cursor-pointer transition-colors duration-200`}
                                onClick={() => handleSlotClick(slot)}
                                >
                                <CardContent className="p-6 flex flex-col items-center justify-center h-48">
                                    <div className="text-2xl font-bold mb-2 text-gray-800">섹터 {slot.id}</div>
                                    {slot.name ? (
                                    <>
                                        <Flower className="w-10 h-10 text-green-500 mb-2" />
                                        <div className="text-lg font-semibold text-gray-800">{slot.name}</div>
                                        <div className="text-sm text-gray-600 mt-2">구독자: {slot.subscriber.slice(0, 5) + "..." }</div>
                                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {slot.startDate}
                                        </div>
                                    </>
                                    ) : (
                                    <Plus className="w-12 h-12 text-green-500" />
                                    )}
                                </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Dialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent className="sm:max-w-[425px] bg-white">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-gray-800">
                                        {selectedSlot && selectedSlot.name ? '구독 정보' : '새로운 식물 구독하기'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                {selectedSlot && selectedSlot.name ? (
                                    <>
                                    <p className="text-gray-800"><strong>식물:</strong> {selectedSlot.name}</p>
                                    <p className="text-gray-800"><strong>구독자:</strong> {selectedSlot.subscriber}</p>
                                    <p className="text-gray-800"><strong>구독 시작일:</strong> {selectedSlot.startDate}</p>
                                    </>
                                ) : (
                                    <>
                                    <Select className="w-fit" onValueChange={setNewSubscriptionPlant} value={newSubscriptionPlant}>
                                            <SelectItem value="bazil">bazil</SelectItem>
                                            <SelectItem value="tomato">tomato</SelectItem>
                                    </Select>
                                    <Button onClick={handleNewSubscription} className="w-full bg-green-500 hover:bg-green-600 text-white">
                                        구독하기
                                    </Button>
                                    </>
                                )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </Column>
                </Cell>
            </Row>
        </Panel>
    );
}

export default SubscribePanel;
