import {useState, useEffect, useCallback} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import { Button } from '../components/button/Button';
import { Row, Cell, Column } from '@enact/ui/Layout';
import './MainPanel.style.css';
import { Card, CardContent } from "../components/card/Card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/dialog/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select/Select"
import { ArrowLeft, Calendar, Flower, Plus } from 'lucide-react'
import { SidebarPanel } from './SideBarPanel';
import css from '../App/App.module.less';

const subscriptionSlots = [
    { id: 1, name: '토마토', subscribers: ['user1', 'user2'], startDate: '2024-09-15' },
    { id: 2, name: '바질', subscribers: ['user3'], startDate: '2024-09-20' },
    { id: 3, name: '', subscribers: [], startDate: '' },
    { id: 4, name: '', subscribers: [], startDate: '' },
    { id: 5, name: '로즈마리', subscribers: ['user4', 'user5'], startDate: '2024-09-10' },
    { id: 6, name: '', subscribers: [], startDate: '' },
    { id: 7, name: '상추', subscribers: ['user6'], startDate: '2024-09-25' },
    { id: 8, name: '', subscribers: [], startDate: '' },
  ]

function SubscribePanel(props) {
    const { main, chart, user, subscribe, logout, isSidebarOpen } = props;
    const [slots, setSlots] = useState(subscriptionSlots)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newSubscriptionPlant, setNewSubscriptionPlant] = useState("")

    const handleSlotClick = (slot) => {
      setSelectedSlot(slot)
      setIsDialogOpen(true)
    }

    const handleNewSubscription = () => {
      if (selectedSlot && newSubscriptionPlant) {
        const today = new Date().toISOString().split('T')[0];
        const updatedSlots = slots.map(slot =>
          slot.id === selectedSlot.id
            ? { ...slot, name: newSubscriptionPlant, subscribers: [...slot.subscribers, `user${Math.floor(Math.random() * 1000)}`], startDate: today }
            : slot
        )
        setSlots(updatedSlots)
        setIsDialogOpen(false)
        setNewSubscriptionPlant("")
      }
    }

    return (
        <Panel css={css} className='custom-panel' noBackButton noCloseButton {...props}>
            {/* <Header title="COSMOS IoT Dashboard" /> */}
            <Row className="flex h-screen bg-gradient-to-br from-green-100 to-green-200 text-gray-800 overflow-hidden" style={{height: '100%', width: '100%'}}>
                <Cell size="12%">
                <SidebarPanel main={main} chart={chart} logout={logout} subscribe={subscribe} isSidebarOpen={isSidebarOpen}/>
                </Cell>
                <Cell className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 p-8">
                    <Column className="max-w-6xl mx-auto">
                        <div className="flex items-center mb-8">
                            <Button variant="ghost" className="text-gray-800 hover:bg-green-200">
                                <ArrowLeft className="mr-2 h-4 w-4" /> 돌아가기
                            </Button>
                            <h1 className="text-3xl font-bold text-gray-800 ml-4">식물 구독</h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {slots.map((slot) => (
                                <Card
                                key={slot.id}
                                className={`${slot.name ? 'bg-green-100' : 'bg-white'} hover:bg-green-200 cursor-pointer transition-colors duration-200`}
                                onClick={() => handleSlotClick(slot)}
                                >
                                <CardContent className="p-6 flex flex-col items-center justify-center h-48">
                                    <div className="text-2xl font-bold mb-2 text-gray-800">슬롯 {slot.id}</div>
                                    {slot.name ? (
                                    <>
                                        <Flower className="w-10 h-10 text-green-500 mb-2" />
                                        <div className="text-lg font-semibold text-gray-800">{slot.name}</div>
                                        <div className="text-sm text-gray-600 mt-2">구독자: {slot.subscribers.join(', ')}</div>
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
                                    <p className="text-gray-800"><strong>구독자:</strong> {selectedSlot.subscribers.join(', ')}</p>
                                    <p className="text-gray-800"><strong>구독 시작일:</strong> {selectedSlot.startDate}</p>
                                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                                        구독 취소하기
                                    </Button>
                                    </>
                                ) : (
                                    <>
                                    <Select className="w-full" onValueChange={setNewSubscriptionPlant} value={newSubscriptionPlant}>
                                        <SelectTrigger className="w-full">
                                        <SelectValue placeholder="식물 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="토마토">토마토</SelectItem>
                                        <SelectItem value="바질">바질</SelectItem>
                                        <SelectItem value="로즈마리">로즈마리</SelectItem>
                                        <SelectItem value="상추">상추</SelectItem>
                                        <SelectItem value="고추">고추</SelectItem>
                                        </SelectContent>
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
