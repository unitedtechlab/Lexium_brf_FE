
import styles from '@/app/assets/css/workflow.module.css';
import { TbAdjustments, TbPlus } from 'react-icons/tb';
import { IconComponent } from './sidebar';
import { BiGridVertical } from 'react-icons/bi';
import Image from "next/image";
import { Avatar, Select } from 'antd';
import userImage from "@/app/assets/images/user.png";
import { useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { AiFillDelete } from 'react-icons/ai';
import Cookies from 'js-cookie';

interface RightSideBarProps {
    variableEntries: any[];
}
const RightSideBar: React.FC<RightSideBarProps> = ({ variableEntries }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectionPending, setSelectionPending] = useState<string[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string[]>([]);
    const [isClicked, setIsClicked] = useState(false);
    const [variableName, setVariableName] = useState<string>(''); // Variable name state
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };
    const saveModal = () => {
    };
    const handleSelectChange = (value: string[]) => {
        setSelectionPending(value);
    };
    const handleSelectedVariable = (value: string[]) => {
        setSelectedVariable(value);

        Cookies.set('selectedVariable', JSON.stringify(value), { expires: 7 });
        const selectedVar = variableEntries.find(([key]) => key === value[0]);
        if (selectedVar) {
            const [, type] = selectedVar;
            setSelectedType([type]);
            Cookies.set('selectedType', JSON.stringify([type]), { expires: 7 });
        }
    };

    const handleVariableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setVariableName(name);
        Cookies.set('variableName', name, { expires: 7 });
    };

    const handleSelectedType = (value: string[]) => {
        setSelectedType(value);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                        <div onClick={openModal}>
                            <IconComponent icon={<TbAdjustments size={18} style={{ transform: 'rotate(90deg)' }} />} />
                        </div>
                    </div>

                    <div className={styles.customvariable}>
                        <div className={styles.variables}>
                            <h6>Local Data</h6>
                            <div className={isClicked ? styles.iconClicked : styles.icon} onClick={toggleMenu}>
                                <IconComponent icon={<TbPlus size={18} />} />
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
                            <div><h6>Create New Local Variables</h6></div>
                            <div> <button className={styles.closebtn} onClick={saveModal}>&#10003;</button></div>
                            <div> <button className={styles.closebtn} onClick={closeModal}>&times;</button></div>
                        </div>
                        <div className={styles.selectedvariable}>
                            <div className={styles.variableBox}>
                                <div className={styles.iconAndLabel}>
                                    <div className={`flex gap-1`}>
                                        <div className={styles.iconWrapper}>
                                            <IconComponent icon={<BiGridVertical size={24} />} />
                                        </div>
                                        <div className={styles.labelWrapper}>
                                            <h6>Variable</h6>
                                            <p>Integer</p>
                                        </div>
                                    </div>
                                    <div className={styles.iconsRight}>
                                        <IconComponent icon={<TbPlus size={20} />} />
                                        <IconComponent icon={<FiMoreHorizontal size={20} style={{ marginLeft: '8px' }} />} />
                                    </div>
                                </div>

                                <div className={styles.dropdownWrapper}>
                                    <Select style={{ width: '100%' }} value={selectedVariable}
                                        mode="multiple" placeholder="Select Variables" onChange={handleSelectedVariable}>
                                        {variableEntries.map(([key]) => (
                                            <Select.Option key={key} value={key}>
                                                {key}
                                            </Select.Option>))}
                                    </Select>
                                    <div className={styles.deleteIcon}>
                                        <IconComponent icon={<AiFillDelete size={18} />} />
                                    </div>
                                </div>
                            </div>
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
                                <input type="text" className={styles.formcontrol} placeholder="5000" value={variableName} onChange={handleVariableNameChange} required />
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
                                <Select
                                    placeholder="Select options"
                                    style={{ width: '100%' }}
                                    onChange={handleSelectedType}
                                    value={selectedType} disabled>
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