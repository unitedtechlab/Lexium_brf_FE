import { useEffect, useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { TbAdjustments, TbPlus } from 'react-icons/tb';
import { IconComponent } from './sidebar';
import { BiGridVertical } from 'react-icons/bi';
import { Button, Select, message } from 'antd';

interface RightSideBarProps {
    variableEntries: [string, string][];
}

const RightSideBar: React.FC<RightSideBarProps> = ({ variableEntries }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isClicked, setIsClicked] = useState(false);
    const [localVariables, setLocalVariables] = useState<any[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string[]>([]);
    const [variableName, setVariableName] = useState<string>('');
    const [variableValue, setVariableValue] = useState<string>('5000');
    const [variableType, setVariableType] = useState<string>('');

    useEffect(() => {
        const storedVariables = JSON.parse(localStorage.getItem('localVariables') || '[]');
        setLocalVariables(storedVariables);
    }, []);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedVariable([]);
        setVariableName('');
        setVariableValue('5000');
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
            value: variableValue,
            selectedVariable: selectedVariable.join(', '),
            type: variableType,
        };

        // Save to local storage
        const updatedVariables = [...localVariables, newVariable];
        localStorage.setItem('localVariables', JSON.stringify(updatedVariables));
        setLocalVariables(updatedVariables);

        closeModal();
        message.success('Variable added successfully!');
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
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
                            <h6>Workflow Name</h6>
                        </div>
                    </div>

                    <div className={styles.variableList}>
                        <div className={styles.variables}>
                            <h6>Variables</h6>
                        </div>

                        <div className={styles.customvariable}>
                            <div className={styles.variables}>
                                <h6>Local Variables</h6>
                                <div className={isClicked ? styles.iconClicked : styles.icon} onClick={openModal}>
                                    <IconComponent icon={<TbPlus size={18} />} />
                                </div>
                            </div>
                            <div className={`${styles.variableNames}`}>
                                <ul>
                                    {localVariables.map((variable, index) => (
                                        <li key={index}>
                                            <div className={styles.iconWrapper}>
                                                <BiGridVertical size={18} />
                                            </div>
                                            <h6>{variable.name}</h6>
                                        </li>
                                    ))}
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
                                    {/* <div className={`${styles.selectVariables} ${styles.inlineVariable}`}>
                                        <h6>Value</h6>
                                        <input
                                            type="text"
                                            className={styles.formcontrol}
                                            placeholder="5000"
                                            value={variableValue}
                                            onChange={(e) => setVariableValue(e.target.value)}
                                            required
                                        />
                                    </div> */}
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
