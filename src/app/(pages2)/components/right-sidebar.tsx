import { useEffect, useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { TbAdjustments, TbPlus } from 'react-icons/tb';
import { IconComponent } from './sidebar';
import { BiGridVertical } from 'react-icons/bi';
import { Button, Select, message } from 'antd';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { MdOutlineDelete } from 'react-icons/md';
import { usePathname } from 'next/navigation';

interface RightSideBarProps {
    variableEntries: [string, string][];
}

const RightSideBar: React.FC<RightSideBarProps> = ({ variableEntries }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [localVariables, setLocalVariables] = useState<any[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string[]>([]);
    const [variableName, setVariableName] = useState<string>('');
    const [variableType, setVariableType] = useState<string>('');
    const [globalVariables, setGlobalVariables] = useState<any[]>([]);
    const [visibleVariables, setVisibleVariables] = useState<number[]>([]);
    const pathname = usePathname();

    const loadVariablesFromStorage = () => {
        const storedLocalVariables = JSON.parse(localStorage.getItem('localVariables') || '[]');
        const storedGlobalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        setLocalVariables(storedLocalVariables);
        setGlobalVariables(storedGlobalVariables);
    };

    useEffect(() => {
        loadVariablesFromStorage();

        const handleGlobalVariableUpdate = () => {
            const updatedGlobalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
            setGlobalVariables(updatedGlobalVariables);
        };

        window.addEventListener('globalVariableUpdated', handleGlobalVariableUpdate);

        return () => {
            window.removeEventListener('globalVariableUpdated', handleGlobalVariableUpdate);
        };
    }, []);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedVariable([]);
        setVariableName('');
        setVariableType('');
    };

    const handleSelectVariable = (value: string[]) => {
        setSelectedVariable(value);
        if (value.length > 0) {
            const foundVariable = variableEntries.find(([key]) => key === value[0]);
            if (foundVariable) {
                setVariableType(foundVariable[1]);
            }
        } else {
            setVariableType('');
        }
    };

    const handleCreateVariable = () => {
        if (!selectedVariable.length || !variableName) {
            message.error('Please select a variable and provide a name.');
            return;
        }

        const newVariable = {
            name: variableName,
            selectedVariable: selectedVariable.join(', '),
            type: variableType,
        };

        const updatedVariables = [...localVariables, newVariable];
        localStorage.setItem('localVariables', JSON.stringify(updatedVariables));
        setLocalVariables(updatedVariables);

        closeModal();
        message.success('Variable added successfully!');
    };

    const handleDeleteVariable = (index: number, isGlobal: boolean) => {
        if (isGlobal) {
            const updatedGlobalVariables = globalVariables.filter((_, i) => i !== index);
            localStorage.setItem('GlobalVariables', JSON.stringify(updatedGlobalVariables));
            setGlobalVariables(updatedGlobalVariables);
            window.dispatchEvent(new Event('globalVariableUpdated'));
            message.success('Global variable deleted successfully!');
        } else {
            const updatedLocalVariables = localVariables.filter((_, i) => i !== index);
            localStorage.setItem('localVariables', JSON.stringify(updatedLocalVariables));
            setLocalVariables(updatedLocalVariables);
            message.success('Local variable deleted successfully!');
        }
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const toggleVisibility = (index: number) => {
        setVisibleVariables((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    return (
        <aside>
            <button
                className={`nostyle ${styles.toggleButton} ${isSidebarVisible ? styles.expanded : styles.collapsed}`}
                onClick={toggleSidebar}
            >
                <IconComponent icon={<TbAdjustments size={18} style={{ transform: 'rotate(90deg)' }} />} />
            </button>

            {isSidebarVisible && (
                <div className={styles.rightsidebar}>
                    <div className={styles.heading}>
                        <div className={styles.headingText}>
                            <h6>Variables</h6>
                        </div>
                    </div>

                    <div className={styles.variableList}>
                        {/* Local Variables Section */}
                        <div className={styles.customvariable}>
                            <div className={styles.variables}>
                                <h6>Local Variables</h6>
                                <div onClick={openModal} className={styles.icon}>
                                    <IconComponent icon={<TbPlus size={18} />} />
                                </div>
                            </div>
                            <div className={`${styles.variableItem}`}>
                                <ul>
                                    {localVariables.map((variable, index) => (
                                        <li key={index} className={styles.variableListItem}>
                                            <div className={styles.variableHeader}>
                                                <div className={styles.variablewrapper}>
                                                    <div className={styles.iconWrapper}>
                                                        <BiGridVertical size={18} />
                                                    </div>
                                                    <h6>{variable.name}</h6>
                                                </div>
                                                <div className='flex gap-1'>
                                                    <button className='nostyle' onClick={() => toggleVisibility(index)}>
                                                        {visibleVariables.includes(index) ? (
                                                            <HiOutlineEyeOff size={18} />
                                                        ) : (
                                                            <HiOutlineEye size={18} />
                                                        )}
                                                    </button>
                                                    <button onClick={() => handleDeleteVariable(index, false)} className='nostyle'>
                                                        <MdOutlineDelete style={{ fontSize: "18px", color: "red" }} />
                                                    </button>
                                                </div>
                                            </div>

                                            {visibleVariables.includes(index) && (
                                                <div className={styles.variableDetailsMenu}>
                                                    <ul className={styles.variableMenuList}>
                                                        <li className={styles.menuItem}>
                                                            <strong>Variable:</strong> {variable.selectedVariable}
                                                        </li>
                                                        <li className={styles.menuItem}>
                                                            <strong>Type:</strong> {variable.type}
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Global Variables Section */}
                        <div className={styles.customvariable}>
                            <div className={styles.variables}>
                                <h6>Global Variables</h6>
                            </div>
                            <div className={`${styles.variableNames}`}>
                                <ul>
                                    {globalVariables.map((variable, index) => (
                                        <li key={index}>
                                            <div className='flex gap-1'>
                                                <div className={styles.iconWrapper}>
                                                    <BiGridVertical size={18} />
                                                </div>
                                                <h6>{variable.GlobalVariableName || 'Unnamed Variable'}</h6>
                                            </div>
                                            <button onClick={() => handleDeleteVariable(index, true)} className='nostyle'>
                                                <MdOutlineDelete style={{ fontSize: "18px", color: "red" }} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Modal for Creating Local Variables */}
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
                                        <Select
                                            mode="multiple"
                                            placeholder="Select options"
                                            style={{ width: '100%' }}
                                            onChange={handleSelectVariable}
                                            value={selectedVariable}
                                        >
                                            {variableEntries
                                                .filter(([_, type]) => type === 'number')
                                                .map(([key]) => (
                                                    <Select.Option key={key} value={key}>
                                                        {key}
                                                    </Select.Option>
                                                ))}
                                        </Select>
                                    </div>
                                    <div className={`${styles.selectVariables}`}>
                                        <h6>Local Variable Name</h6>
                                        <input
                                            type="text"
                                            className={styles.formcontrol}
                                            placeholder="Name"
                                            value={variableName}
                                            onChange={(e) => setVariableName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={styles.rightbar}>
                                    <h6>Variable Properties</h6>
                                    <div className={`${styles.selectVariables} ${styles.inlineVariable}`}>
                                        <h6>Data Types</h6>
                                        <p className={styles.typeData}>{variableType || 'number'}</p>
                                    </div>
                                </div>
                                <div className={styles.createbtn}>
                                    <Button className='btn' onClick={handleCreateVariable}>
                                        Create
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
};

export default RightSideBar;
