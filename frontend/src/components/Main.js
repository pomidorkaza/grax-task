
import React, { useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import '../styles.css';
import { Link } from "react-router-dom/cjs/react-router-dom.min";
const API_URL = 'http://localhost:5000';

export const Preloader = () => {
    return <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center'
    }}> <div className="spinner-border" style={{
        margin: '0 auto'
    }} role="status">
            <span className="sr-only">Loading...</span>
        </div>
    </div>;
}


function isRedacted(id, user) {
    return id == user.id;
}
export const Main = () => {

    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [isError, setError] = useState(false);
    const [paginationData, setPag] = useState({
        beginPage: 0,
        endPage: 10,
        step: 5
    });
    const [redactedUserId, setRedactedUserId] = useState(null);
    const [updatedData, setUpdatedData] = useState({
        id: null,
        name: "",
        has_tested: false,
        has_hospitilized: false

    });

    const [addPatientData, setaddpatientData] = useState({
        name: "",
        has_tested: false,
        has_hospitilized: false,
        addresses: ''
    });


    const addHandler = (e) => {
        // поля для нового пациента
        let curKey = e.target.name;
        let value = e.target.value;
        setaddpatientData((prevVar) => {
            return {
                ...prevVar,
                [curKey]: value
            }
        })

    };

    const handleDeleteRequest=(patient_id)=>{
        fetch(`${API_URL}/delete_patient/${patient_id}`,
        {
            method:"POST"
        })
        .then(res=>res.json())
        .then(data=>{

            console.log(data);
            if(!data.error){
                document.location.reload();
            }
        })
    }
    const addRequest = () => {
        setLoading(true);
        fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(addPatientData)
        }).then(res => res.json())
            .then((data) => {

                setLoading(false);
                if (!data.error) {
                    document.location.reload();
                }
                setError(true);
            })
    }
    const updateHandler = (e) => {
        let curKey = e.target.name;
        let value = e.target.value;
        setUpdatedData((prevVar) => {
            return {
                ...prevVar,
                [curKey]: value
            }
        })
    }

    const updateRequest = () => {

        setLoading(true);
        fetch(`${API_URL}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(updatedData)
        }).then(res => res.json())
            .then((data) => {

                setLoading(false);
                if (!data.error) {
                    document.location.reload();
                }
                setError(true);

            })
    }


    useEffect(() => {
        fetch(`${API_URL}/all`).then(res => res.json())
            .then((data) => {
                setLoading(false);
                if (!data.error) {

                    let curData = [...data.body];

                    // console.log(curData.splice(0,5));
                    setPag((prevPag) => {
                        return {
                            ...prevPag,
                            endPage: Math.ceil(data.body.length / prevPag.step),
                            curPage: 0
                        }
                    })
                    setAllUsers(data.body);

                }
                else {
                    setError(true);
                }

            })
    }, []);
    return (<div className="App">

        <h1>Это список пациентов:</h1>
        <hr />
        <div style={{
            width: '100%',
            textAlign: 'center'
        }}>
            <h3> Редактируй</h3>
            <br />
        </div>
        <table className="table">

            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Имя гражданина</th>
                    <th scope="col">Проходил тестирование</th>
                    <th scope="col">Госпитализирован</th>
                    <th scope="col">&nbsp;</th>

                </tr>
            </thead>

            {!isLoading && <tbody>

                {(() => {
                    if (allUsers.length) {
                        return allUsers.slice(paginationData.beginPage, paginationData.beginPage + paginationData.step).map((item) => {

                            return <tr key={item.id} className={item.has_tested ? 'table-success' : item.has_hospitilized ? 'table-danger' : ''}>
                                <th scope="row"
                                    data-id={item.id}
                                >{
                                    <button type="button"
                                        onClick={(e)=>{
                                            handleDeleteRequest(item.id)
                                        }}
                                        style={{
                                            margin:'0 10px'
                                        }}
                                    className="btn btn-danger">X</button>
                                }
                                    {!isRedacted(redactedUserId, item) && <button className="btn btn-light"
                                        onClick={(e) => {
                                            setUpdatedData({
                                                id: item.id,
                                                name: item.name,
                                                has_hospitilized: Boolean(item.has_hospitilized),
                                                has_tested: Boolean(item.has_tested)
                                            });
                                            !isRedacted(redactedUserId, item) ?
                                                setRedactedUserId(item.id) : setRedactedUserId(null);


                                        }}
                                    >
                                        Отредактировать</button>}
                                    {isRedacted(redactedUserId, item)
                                        && <button className="btn btn-warning"
                                            onClick={(e) => updateRequest()}
                                        >Закончить редактирование</button>
                                    }
                                </th>
                                <td>{!isRedacted(redactedUserId, item) && item.name}
                                    {
                                        isRedacted(redactedUserId, item) ? <input

                                            type="text"
                                            value={updatedData.name}
                                            name="name"
                                            onChange={(e) => { updateHandler(e) }}
                                        /> : null
                                    }

                                </td>
                                <td>{!isRedacted(redactedUserId, item) && (item.has_tested ? "Да" : "Нет")}
                                    {
                                        isRedacted(redactedUserId, item) ? <select
                                            name="has_tested"
                                            value={updatedData.has_tested}
                                            onChange={(e) => { updateHandler(e) }}
                                        >
                                            <option value="true"

                                            >Да</option>
                                            <option value="false" >Нет</option>
                                        </select> : null
                                    }
                                </td>
                                <td   >{!isRedacted(redactedUserId, item) && (item.has_hospitilized ? "Да" : "Нет")}
                                    {
                                        isRedacted(redactedUserId, item) ? <select
                                            name="has_hospitilized"
                                            value={updatedData.has_hospitilized}
                                            onChange={(e) => updateHandler(e)}
                                        >
                                            <option value="true"

                                            >Да</option>
                                            <option value="false"
                                            >Нет</option>
                                        </select> : null
                                    }

                                </td>
                                <td><Link to={`patient/${item.id}`}>Перейти к пациенту</Link></td>
                            </tr>
                        });
                    }
                    return <tr>
                        <th>Записей не найдено</th>
                    </tr>;


                })()}
            </tbody>}
        </table>
        <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <ul
                className="pagination">
                <li
                    className="page-item"><a
                        className="page-link" href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setPag((prevPag) => {
                                console.log(prevPag);
                                return {
                                    ...prevPag,
                                    beginPage: prevPag.beginPage !== 0 ? prevPag.beginPage - 1 : prevPag.beginPage
                                }
                            })
                        }}
                    >{"<"}</a></li>

                {
                    (() => {

                        let pag_list = [];
                        for (let i = 0; i < paginationData.endPage; i++) {
                            if (i >= paginationData.beginPage || i <= paginationData.beginPage + paginationData.step) {
                                pag_list.push(<li key={i}
                                    onClick={(e) => {
                                        setPag({
                                            ...paginationData,
                                            beginPage: i + 1
                                        })
                                    }}
                                    className="page-item"><a className="page-link" href="#"
                                    > {i + 1}</a></li>)
                            }
                        }
                        return pag_list;
                    })()
                }

                <li
                    className="page-item"><a
                        className="page-link"

                        onClick={(e) => {
                            e.preventDefault();
                            setPag((prevPag) => {

                                return {
                                    ...prevPag,
                                    beginPage: prevPag.beginPage < prevPag.endPage ? prevPag.beginPage + 1 : prevPag.beginPage
                                }
                            })
                        }}
                        href="#">{">"}</a></li>
            </ul>
        </div>
        {isLoading && <Preloader />}
        <div className="container">
            <h5>  Добавить нового гражданина</h5>
            <div className="form-group">
                <span style={{
                    display: 'flex',
                    flexFlow: 'column',
                    maxWidth: '200px',
                    margin: '0 auto'
                }}>
                    <label htmlFor="name" style={{
                        textAlign: 'start'
                    }}>Имя: </label>
                    <input id="name" type="text"

                        name="name"
                        value={addPatientData.name}
                        onChange={(e) => addHandler(e)}
                    />
                </span>
                <span style={{
                    display: 'flex',
                    flexFlow: 'column',
                    maxWidth: '200px',
                    margin: '0 auto'
                }}>
                    <label htmlFor="has_tested" style={{
                        textAlign: 'start'
                    }}>Проходил тестирование: </label>
                    <select id="has_tested"
                        name="has_tested"
                        value={addPatientData.has_tested}
                        onChange={(e) => addHandler(e)}
                    >
                        <option value="true">Да</option>
                        <option value="false">Нет</option>

                    </select>
                </span>
                <span style={{
                    display: 'flex',
                    flexFlow: 'column',
                    maxWidth: '200px',
                    margin: '0 auto'
                }}>
                    <label htmlFor="has_hosp" style={{
                        textAlign: 'start'
                    }}>Госпитализирован: </label>
                    <select id="has_hosp"
                        name="has_hospitilized"
                        value={addPatientData.has_hospitilized}
                        onChange={(e) => addHandler(e)}
                    >
                        <option value="true">Да</option>
                        <option value="false">Нет</option>

                    </select>
                </span>

                <textarea
                    style={{
                        margin: '10px auto',
                        width: '200px',
                        minHeight: '160px'
                    }}
                    placeholder="Введите адреса через запятую"
                    name="addresses"
                    value={addPatientData.addresses}
                    onChange={(e) => addHandler(e)}
                />
            </div>
            <div className="form-group">
                <button style={{
                    margin: '10px auto'
                }} className="btn btn-primary"
                    onClick={(e) => { addRequest(e) }}
                >Добавить</button>
            </div>
        </div>

    </div>);
}



export const Patient = () => {
    const { id } = useParams();

    const history = useHistory();
    const [isLoading, setLoading] = useState();
    const [allAddresses, setAllAdresses] = useState([]);

    const [redactedAddress, setRedactedAdress] = useState({
        id: null,
        name: '',
        data_from: '',
        data_to: ''
    });

    const [addAddressData, setaddAddressData] = useState({
        name: '',
        data_from: '',
        data_to: ''
    })

    const handleAddData =(e)=>{
        let key = e.target.name;
        let val = e.target.value;
        setaddAddressData((prevVal) => {
            return {
                ...prevVal,
                [key]: val
            }
        });
    }

    const handleAddRequest=()=>{
        fetch(`${API_URL}/add_address/${id}`,{
            method:'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(addAddressData)
        })
        .then(res=>res.json())
        .then((data)=>{
              
            if(!data.error){
                document.location.reload();
            }
        })
    }
    const handleRedactChange = (e) => {
        let key = e.target.name;
        let val = e.target.value;
        setRedactedAdress((prevVal) => {
            return {
                ...prevVal,
                [key]: val
            }
        })
    };


    const handleDeleteRequest =(id)=>{
        fetch(`${API_URL}/delete_address/${id}`,{
            method:"POST",
            
        })
        .then((res)=>res.json())
        .then(data=>{
             if(!data.error){
                    document.location.reload();
            }
        })
    }
    const finishUpdate = () => {
        fetch(`${API_URL}/edit_address`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(redactedAddress)
        }).then(res => res.json())
            .then(data => {
                if (!data.error) {
                    console.log(data);
                    debugger
                    document.location.reload();
                }
            })
    }
    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/patients_addresses/?id=${id}`)
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (!data.error) {
                    setAllAdresses(data.body)
                }

            })
    }, []);
    return <div className="patient-container">

        <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start'
        }}>

            <button style={{ margin: '10px 20px', width: '200px' }} type="button"
                onClick={() => {
                    history.goBack();
                }}
                className="btn btn-primary">Назад</button>
            <h3 style={{
                margin: '10px 20px'
            }}>Таблица адресов для пациента:</h3>
        </div>
        <table className="table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Название</th>
                    <th scope="col">Начало пребывания</th>
                    <th scope="col">Конец пребывания</th>
                </tr>
            </thead>
            <tbody>
                {
                    allAddresses.length ? allAddresses.map((item, index) => {

                        return <tr key={index}>
                            <th scope="row">
                                {
                                    <button type="button" 
                                    style={{
                                        margin:'0 10px'
                                    }}
                                    onClick={(e)=>{
                                        handleDeleteRequest(item.id);
                                    }}
                                    className="btn btn-danger">
                                        X
                                    </button>
                                }
                                {
                                    !isRedacted(redactedAddress.id, item) && <button className="btn btn-light"
                                        onClick={(e) => {
                                            setRedactedAdress({
                                                id: item.id,
                                                name: item.name,
                                                data_from: item.data_from,
                                                data_to: item.data_to
                                            });
                                        }}
                                    >Отредактировать</button>
                                }
                                {
                                    isRedacted(redactedAddress.id, item) && <button className="btn btn-warning"
                                        onClick={(e) => {
                                            finishUpdate();
                                        }}
                                    >Закончить редактирование</button>
                                }
                            </th>
                            <td>{!isRedacted(redactedAddress.id, item) ? item.name
                                : <input type="text" name="name" value={redactedAddress.name}
                                    onChange={(e) => handleRedactChange(e)}
                                />
                            }

                            </td>
                            <td>{!isRedacted(redactedAddress.id, item) ? item.data_from
                                : <input type="date" value={redactedAddress.data_from}
                                    name="data_from"
                                    onChange={(e) => handleRedactChange(e)}
                                />
                            }</td>
                            <td>{!isRedacted(redactedAddress.id, item) ? item.data_to :
                                <input type="date"
                                    name="data_to"
                                    value={redactedAddress.data_to}
                                    onChange={(e) => handleRedactChange(e)}
                                />

                            }</td>
                        </tr>
                    })
                        : null
                }
            </tbody>
        </table>
        {!allAddresses.length && <div style={{
            width: '100%',
            textAlign: 'center'
        }}>У данного пацента нет адресов</div>}

        <div className="container">
            <form style={{
                width: '100%'
            }}>
                <div className="form-group" style={{
                    display: 'flex',
                    width: '300px',
                    flexFlow: 'column',
                    margin: '0 auto',

                }}>
                    <input  
                            type="text"
                            name="name"
                            value={addAddressData.name}
                            onChange={(e)=>handleAddData(e)}
                        style={{
                            margin: '10px'
                        }}
                        placeholder="название"
                    />
                    <input name="data_from"
                            type="date"
                        value={addAddressData.data_from}
                        onChange={(e)=>handleAddData(e)}
                        placeholder="дата начала пребывания"
                        style={{
                            margin: '10px'
                        }} />
                    <input name="data_to"
                            type="date"
                        value={addAddressData.data_to}
                        onChange={(e)=>handleAddData(e)}

                        placeholder="дата конца пребывания"
                        style={{
                            margin: '10px'
                        }} />
                    <button className="btn btn-primary"
                        onClick={(e)=>{
                            e.preventDefault();
                            handleAddRequest();
                        }}
                    >Добавить адресс</button>

                </div>

            </form>
        </div>
    </div>;
}