
import styles from '@/app/assets/css/workflow.module.css';
import { TbAdjustments, TbPlus } from 'react-icons/tb';
import { IconComponent } from './sidebar';
import { BiGridVertical } from 'react-icons/bi';
import Image from "next/image";
import { Avatar, Select } from 'antd';
import userImage from "@/app/assets/images/user.png";
import { useEffect, useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { FaDeleteLeft } from 'react-icons/fa6';
import { TiDelete } from 'react-icons/ti';
import { AiFillDelete } from 'react-icons/ai';

interface RightSideBarProps {
    variableEntries: any[];
}
const RightSideBar: React.FC<RightSideBarProps> = ({ variableEntries }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectionPending, setSelectionPending] = useState<string[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        console.log(" variableEntries:", variableEntries);
    }, [variableEntries]);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };
    const handleSelectChange = (value: string[]) => {
        setSelectionPending(value);
    };
    const handleSelectedVariable = (value: string[]) => {
        setSelectedVariable(value);
    };
    const handleSelectedType = (value: string[]) => {
        setSelectedType(value);
    };
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    return (
        <aside>
            <div className={styles.rightsidebar}>
                <div className={styles.heading}>
                    <Avatar size="large" src={<Image src={userImage} alt="User Image" priority width={40} height={40} />} />
                    <div className={styles.headingText}>
                        <h6>Workflow</h6>
                    </div>
                </div>
                <div className={styles.operations}>
                    <div className={styles.variables}>
                        <h6>Local Variable</h6>
                        <div className="open-modal-btn" onClick={openModal}>
                            <IconComponent icon={<TbAdjustments size={20} style={{ transform: 'rotate(90deg)' }} />} />
                        </div>
                    </div>
                    <div className={styles.variables}>
                        <h6>Local Data</h6>
                        <div className={isClicked ? styles.iconClicked : styles.icon}  onClick={toggleMenu}>
                            <IconComponent icon={<TbPlus size={20} />} />
                        </div>
                        {isMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                <ul>
                                    <li>Variables</li>
                                    <li>Constant</li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className={`${styles.variables} ${styles.localData}`}>
                        <div className={styles.iconWrapper}>
                            <BiGridVertical size={30} />
                        </div>
                        <div>
                            <h6>Variable</h6>
                        </div>
                    </div>
                    <div className={`${styles.variables} ${styles.localData}`}>
                        <div className={styles.iconWrapper}>
                            <BiGridVertical size={30} />
                        </div>
                        <div>
                            <h6>Constant</h6>
                        </div>
                    </div>
                </div>
                <div className={styles.operations} >
                    <h6>Global Variable</h6>
                    <div className={`${styles.variables} ${styles.localData}`}>
                        <div className={styles.iconWrapper}>
                            <BiGridVertical size={30} />
                        </div>
                        <div>
                            <h6>Basic</h6>
                        </div>
                    </div>
                    <div className={`${styles.variables} ${styles.localData}`}>
                        <div className={styles.iconWrapper}>
                            <BiGridVertical size={30} />
                        </div>
                        <div>
                            <h6>HRA</h6>
                        </div>
                    </div>
                </div>
            </div>

            {isModalVisible && (
                <div className={styles.custommodalwrapper}>
                    <div className={styles.custommodal}>

                        <div className={styles.rightsidebarheader}>
                            <h6>Create New Local Variables</h6>
                            <button className={styles.closebtn} onClick={closeModal}>
                                &times;
                            </button>
                        </div>
                        <div className={styles.selectedvariable}>
                            <div className={styles.variableContainer}>
                                <div className={styles.variableBox}>
                                    <div className={styles.iconAndLabel}>
                                        <div className={styles.iconWrapper}>
                                            <IconComponent icon={<BiGridVertical size={24} />} />
                                        </div>
                                        <div className={styles.labelWrapper}>
                                            <h6>Variable</h6>
                                            <p>Integer</p>
                                        </div>
                                        <div className={styles.iconsRight}>
                                            <IconComponent icon={<TbPlus size={20} />} />
                                            <IconComponent icon={<FiMoreHorizontal size={20} style={{ marginLeft: '8px' }} />} />
                                        </div>
                                    </div>

                                    <div className={styles.dropdownWrapper}>
                                        <Select
                                            placeholder="Select Variable"
                                            style={{ width: '100%' }}
                                            defaultValue="Basic_Salary"
                                        >
                                            <Select.Option value="Basic_Salary">Basic_Salary</Select.Option>
                                        </Select>
                                        <div className={styles.deleteIcon}>
                                            <IconComponent icon={<AiFillDelete size={20} />} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className={styles.rightbar}>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Variable</h6>
                                <Select mode="multiple" placeholder="Select options" onChange={handleSelectChange} value={selectionPending} style={{ width: '100%' }}>
                                    {variableEntries.map(([key]) => (
                                        <Select.Option key={key} value={key}>
                                            {key}
                                        </Select.Option>))}
                                </Select>
                            </div>
                        </div> */}
                        <div className={styles.rightbar}>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Select Variable</h6>
                                <Select mode="multiple" placeholder="Select options" style={{ width: '100%' }}
                                    onChange={handleSelectedVariable}
                                    value={selectedVariable} >
                                    {variableEntries.map(([key]) => (
                                        <Select.Option key={key} value={key}>
                                            {key}
                                        </Select.Option>))}
                                </Select>
                            </div>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Variable Name</h6>
                                <input type="text" className={styles.formcontrol} placeholder="5000" required />
                            </div>
                        </div>
                        <div className={styles.rightbar}>
                            <h6>Variable Properties</h6>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Value</h6>
                                <input type="text" className={styles.formcontrol} placeholder="5000" required />
                            </div>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Data Types</h6>
                                <Select
                                    placeholder="Select options"
                                    style={{ width: '100%' }}
                                    onChange={handleSelectedType}
                                    value={selectedType} >
                                    {variableEntries.map(([key, type]) => (
                                        <Select.Option key={type} value={type}>
                                            {type}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};
export default RightSideBar;