
import { useEffect, useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { TbAdjustments, TbPlus } from 'react-icons/tb';
import { IconComponent } from './sidebar';
import { BiGridVertical } from 'react-icons/bi';
import { Button, Select } from 'antd';


interface RightSideBarProps {
    variableEntries: any[];
}
const RightSideBar: React.FC<RightSideBarProps> = ({ variableEntries }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <aside>
            <div className={styles.rightsidebar}>
                <div className={styles.heading}>
                    <div className={styles.headingText}>
                        <h6>Workflow Name</h6>
                    </div>
                </div>

                <div className={styles.variableList}>
                    <div className={styles.variables}>
                        <h6>Local Variable</h6>
                        <button className='nostyle'>
                            <IconComponent icon={<TbAdjustments size={18} style={{ transform: 'rotate(90deg)' }} />} />
                        </button>
                    </div>

                    <div className={styles.customvariable}>
                        <div className={styles.variables}>
                            <h6>Local Data</h6>
                            <div className={isClicked ? styles.iconClicked : styles.icon} onClick={openModal}>
                                <IconComponent icon={<TbPlus size={18} />} />
                            </div>
                        </div>
                        <div className={`${styles.variableNames}`}>
                            <ul>
                                <li>
                                    <div className={styles.iconWrapper}>
                                        <BiGridVertical size={18} />
                                    </div>
                                    <h6>Variable</h6>
                                </li>
                                <li>
                                    <div className={styles.iconWrapper}>
                                        <BiGridVertical size={18} />
                                    </div>
                                    <h6>Variable 2</h6>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.customvariable}>
                        <div className={styles.variables}>
                            <h6>Global Variable</h6>
                        </div>
                        <div className={`${styles.variableNames}`}>
                            <ul>
                                <li>
                                    <div className={styles.iconWrapper}>
                                        <BiGridVertical size={18} />
                                    </div>
                                    <h6>HRA</h6>
                                </li>
                                <li>
                                    <div className={styles.iconWrapper}>
                                        <BiGridVertical size={18} />
                                    </div>
                                    <h6>EDA</h6>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            {isModalVisible && (
                <div className={styles.custommodalwrapper}>
                    <div className={styles.custommodal}>
                        <div className={styles.rightsidebarheader}>
                            <h6>Create Local Variables</h6>
                            <button className={styles.closebtn} onClick={closeModal}>
                                &times;
                            </button>
                        </div>
                        <div className={styles.rightbar}>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Select Variable</h6>
                                <Select mode="multiple" placeholder="Select options" style={{ width: '100%' }} >
                                    {variableEntries.map(([key]) => (
                                        <Select.Option key={key} value={key}>
                                            {key}
                                        </Select.Option>))}
                                </Select>
                            </div>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Variable Name</h6>
                                <input type="text" className={styles.formcontrol} placeholder="Name" required />
                            </div>
                        </div>
                        <div className={styles.rightbar}>
                            <h6>Variable Properties</h6>
                            <div className={`${styles.selectVariables} ${styles.inlineVariable}`}>
                                <h6>Value</h6>
                                <input type="text" className={styles.formcontrol} placeholder="5000" required />
                            </div>
                            <div className={`${styles.selectVariables} ${styles.inlineVariable}`}>
                                <h6>Data Types</h6>
                                <p className={styles.typeData}>Number</p>
                            </div>
                        </div>
                        <div className={styles.createbtn}>
                            <Button className='btn'>Create</Button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};
export default RightSideBar;