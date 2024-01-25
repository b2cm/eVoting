import React, {
    useState
} from 'react';
import {
    Box,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import dayjs from 'dayjs';
import MyDatePicker from '../../common/MyDatePicker';
import SearchField from '../../common/SearchField';

var isBetween = require('dayjs/plugin/isBetween');
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
var isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export default function HomeActions(props) {
    const [status, setStatus] = useState('Alle Statuen');
    const {voteData, setVoteDataFilter, setWaitingMessage } = props;
    const [searchValue, setSearchValue] = useState('');
    const [searchDateStart, setSearchDateStart] = useState(null);
    const [searchDateEnd, setSearchDateEnd] = useState(null);

    const handleSearchVotesByName = (event) => {
        setSearchValue(event.target.value);
        const searchedVotes = [];
        for (let i = 0; i < voteData.length; i++) {
            if (voteData[i].voteName.toLowerCase().startsWith((event.target.value).toLowerCase())) {
                searchedVotes.push(voteData[i]);
            }
        };
        if (searchedVotes.length === 0) {
            setWaitingMessage('Keine Wahlen gefunden');
        }
        setVoteDataFilter([...searchedVotes]);
        
    }

    const handleSearchVotesByDate = (date, label) => {
        const searchedVotes = [];

        if (label === 'Erstellt am:') {
            setSearchDateStart(date);
        } else if (label === 'bis') {
            setSearchDateEnd(date);
        }

        for (let i = 0; i < voteData.length; i++) {
            const createdAt = dayjs(voteData[i].createdAt * 1000).set('hour', 0).set('minute', 0).set('second',0);
            if (label === 'Erstellt am:') {
                if (searchDateEnd != null) {
                   if (createdAt.isBetween(date, searchDateEnd, '', '[]')) {
                        searchedVotes.push(voteData[i]);
                   }
                } else {
                    if (createdAt.isSameOrAfter(date)) {
                        searchedVotes.push(voteData[i]);
                    }
                }
            } else if (label === 'bis') {
                if (searchDateStart != null) {
                    if (createdAt.isBetween(searchDateStart, date, '', '[]')) {
                        searchedVotes.push(voteData[i]);
                   }
                } else {
                    if (createdAt.isSameOrBefore(date)) {
                        searchedVotes.push(voteData[i]);
                    }
                }
            }
        };

        if (searchedVotes.length === 0) {
            setWaitingMessage('Keine Wahlen gefunden');
        }
        setVoteDataFilter([...searchedVotes]);
    }

    const handleSarchVotesByState = async(event) => {
        const value = event.target.value;    
        setStatus(value);
        if (value === 'Alle Statuen') {
            setVoteDataFilter(voteData);
        } else {
            if (voteData.length>0) {
                const newData = voteData.filter(elem => elem.state.toLowerCase() === value.toLowerCase());
                newData.sort((a, b) => compareNumbers(a, b));
                setVoteDataFilter(newData);
                if (newData.length < 0) {
                    console.log('keine Wahlen gefunden');
                    setWaitingMessage('Keine Wahlen gefunden');
                }
            }
            
        }
    }

    const compareNumbers = (a, b) => {
        const A = a.createAt;
        const B = b.createAt;
        // Descending order
        return B - A
    }


  return (
    <Box sx={{
        display: 'flex',
        flexDirection: {xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row'},
        justifyContent: 'space-between',
        marginTop: 3,
        //border: 'solid 1px'

    }}>
        <Box sx={{
            display: 'flex',
            flexGrow: 1/2,
            justifyContent: 'space-between',
            //border: 'solid 1px red',
            marginBottom: {xs: 1}
        }}
        >
            <FormControl sx={{
                width: {xs: 150, sm: 150, md: 200, lg: 200, xl: 200}
            }}>
                <Select
                    size='small'
                    labelId='select-label'
                    value={status}
                    //label='Status'
                    onChange={handleSarchVotesByState}>
                    <MenuItem value={'Alle Statuen'}>Alle Statuen</MenuItem>
                    <MenuItem value={'In Vorbereitung'}>In Vorbereitung</MenuItem>
                    <MenuItem value={'Aktuell in Abstimmung'}>Aktuell in Abstimmung</MenuItem>
                    <MenuItem value={'Abgeschlossen'}>Abgeschlossen</MenuItem>
                    <MenuItem value={'Abgebrochen'}>Abgrebrochen</MenuItem>
                </Select>
            </FormControl>
            <Box marginLeft={{md: 20}}>
            <MyDatePicker label='Erstellt am:' value={searchDateStart} setValue={setSearchDateStart} handleSearchVotesByDate={handleSearchVotesByDate} />
            <span style={{paddingRight: '0.5vh'}} />
            <MyDatePicker label='bis' value={searchDateEnd} setValue={setSearchDateEnd} handleSearchVotesByDate={handleSearchVotesByDate} />
            </Box>
        
        </Box>
    
        <Box width={{md: 370}}>
        <SearchField value={searchValue} handleSearchValue={handleSearchVotesByName} />
        </Box>
        
        
    </Box>
  )
}
