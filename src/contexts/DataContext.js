import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './AuthContext';
import useInterval from '../hooks/useInterval';

const DataContext = createContext();
const pollingDelay = 120;// seconds

export const DataProvider = ({ children }) => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useUser();

    const { date = null } = data || {}; 

    const getData = useCallback( (date = null) => {
        axios
            .request({
                url: 'https://jcarignan.com/velo/',// /update
                headers: null,// tmp
                method: 'get',
                params: {
                    date,
                },
            })
            .then((res) => {
                const { data = null } = res || {};
                console.log('Data received.', data);
                setData(data);
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
        
    }, [setData, setError, setLoading]);

    useEffect( () => {
        if (user !== null) {
            console.log('Getting initial data...');
            getData();
        }        
    }, [getData, user]);

    const pollData = useCallback( () => {
        if (user !== null) {
            console.log('Updating data...');
            getData(date);
        }        
    }, [getData, date, user])

    // useInterval(pollData, pollingDelay * 1000);

    return (
        <DataContext.Provider value={{ data, loading, error }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const ctx = useContext(DataContext);
    if (ctx === undefined) {
        throw new Error('useData can only be used inside DataProvider');
    }
    return ctx;
};

export const useData = () => {
    const ctx = useDataContext(DataContext);
    const { data = null } = ctx || {};

    return data;
};

export const useTroncons = () => {
    const data = useData();
    const { troncons = null } = data || {};
    return troncons;
};

export const useContributions = () => {
    const data = useData();
    const { contributions = null } = data || {};
    return contributions;
};

export const useDataDate = () => {
    const data = useData();
    const { date = null } = data || {};
    return date;
};

export default DataContext;
