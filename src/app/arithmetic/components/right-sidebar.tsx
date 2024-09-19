import styles from '@/app/assets/css/workflow.module.css';
import { TbPlus } from 'react-icons/tb';
import { IconComponent } from './sidebar';
import { BiGridVertical } from 'react-icons/bi';
import { Collapse, Select } from 'antd';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
const { Panel } = Collapse;

interface RightSideBarProps {
    variableEntries: [string, string][];
}

interface Variable {
    localVariableName: string;
    details: {
        name: string;
        type: string;
        value: string;
    }[];
}

const RightSideBar: React.FC<RightSideBarProps> = ({ variableEntries }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedVariable, setSelectedVariable] = useState<string[]>([]);
    const [variables, setVariables] = useState<Variable[]>([]);
    const [variableName, setVariableName] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [valueInput, setValueInput] = useState<string>("");

    useEffect(() => {
        const storedVariables = Cookies.get('variables');
        if (storedVariables) {
            const parsedVariables: Variable[] = JSON.parse(storedVariables);
            setVariables(parsedVariables);
        }
    }, []);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
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
        setVariableName(e.target.value);
    };

    const handleSelectedType = (value: string[]) => {
        setSelectedType(value);
    };
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValueInput(e.target.value);
    };
    const saveModal = () => {
        const existingVariable = variables.find(variable => variable.localVariableName === variableName);

        if (existingVariable) {
            const updatedVariables = variables.map(variable => {
                if (variable.localVariableName === variableName) {
                    return {
                        ...variable,
                        details: [
                            ...(Array.isArray(variable.details) ? variable.details : []),  
                            ...selectedVariable.map(variable => ({
                                name: variable, 
                                type: selectedType[0] || '' ,
                                value: valueInput
                            })),
                        ]
                    };
                }
                return variable;
            });
            setVariables(updatedVariables);
            Cookies.set('variables', JSON.stringify(updatedVariables), { expires: 7 });
        } else {

            const newVariable = {
                localVariableName: variableName,
                details: selectedVariable.map(variable => ({
                    name: variable, 
                    type: selectedType[0] || '', 
                    value: valueInput
                }))
            };

            const newVariables = [...variables, newVariable];
            setVariables(newVariables);
            Cookies.set('variables', JSON.stringify(newVariables), { expires: 7 });
        }

        setSelectedVariable([]);
        setVariableName('');
        setSelectedType([]);
        setValueInput("");
        closeModal();
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
                    </div>

                    <div className={styles.customvariable}>
                        <div className={styles.variables}>
                            <h6>Local Data</h6>
                            <div onClick={openModal}>
                                <IconComponent icon={<TbPlus size={20} />} />
                            </div>
                        </div>

                        <div className={styles.variableNames}>
                            <Collapse accordion={false} className='accordian'>
                                {variables.map((variable, index) => (
                                    <Panel
                                        key={index}
                                        header={variable.localVariableName}
                                        className={styles.panel}
                                    >
                                        <ul className={styles.detailsList}>
                                            {variable.details.map((detail, detailIndex) => (
                                                <li key={detailIndex}>
                                                    <p>{detail.name}</p>
                                                    <p>{detail.type}</p>
                                                    <p>{detail.value}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </Panel>
                                ))}
                            </Collapse>
                        </div>

                    </div>

                    <div className={styles.customvariable}>
                        <div className={styles.variables}>
                            <h6>Global Variable</h6>
                        </div>
                        <div className={styles.variableNames}>
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

            {/* Modal for creating new variables */}
            {isModalVisible && (
                <div className={styles.custommodalwrapper}>
                    <div className={styles.custommodal}>
                        <div className={styles.rightsidebarheader}>
                            <div><h6>Create New Local Variables</h6></div>
                            <div>
                                <button className={styles.closebtn} onClick={closeModal}>&times;</button>
                            </div>
                        </div>

                        <div className={styles.rightbar}>
                            <div className={`${styles.selectVariables}`}>
                                <h6>Select Variable</h6>
                                <Select
                                    style={{ width: '100%' }}
                                    value={selectedVariable}
                                    mode="multiple"
                                    placeholder="Select Variables"
                                    onChange={handleSelectedVariable}
                                >
                                    {variableEntries.map(([key]) => (
                                        <Select.Option key={key} value={key}>
                                            {key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>

                            <div className={`${styles.selectVariables}`}>
                                <h6>Variable Name</h6>
                                <input
                                    type="text"
                                    className={styles.formcontrol}
                                    placeholder="Enter Variable Name"
                                    value={variableName}
                                    onChange={handleVariableNameChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.rightbar}>
                            <h6>Variable Properties</h6>
                            <div className={`${styles.selectVariables} ${styles.inlineVariable}`}>
                                <h6>Value</h6>
                                <input
                                    type="text"
                                    className={styles.formcontrol}
                                    placeholder="Enter Value"
                                    value={valueInput} onChange={handleValueChange} required />
                            </div>
                            <div className={`${styles.selectVariables} ${styles.inlineVariable}`}>
                                <h6>Data Types</h6>
                                <Select
                                    placeholder="Select options"
                                    style={{ width: '100%' }}
                                    onChange={handleSelectedType}
                                    value={selectedType}
                                    disabled >
                                    {variableEntries.map(([key, type]) => (
                                        <Select.Option key={type} value={type}>
                                            {type}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className={styles.localVarBut}>
                            <button className={styles.savebtn} onClick={saveModal}>
                                Create Local Variable
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default RightSideBar;

