import React from 'react';
import 'dayjs/locale/de';
import {
    TextField,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function MyDatePicker(props) {
    const { value, setValue, label, handleSearchVotesByDate } = props;

    const handleChangeValue = (value) => {
      //setValue(value);
      handleSearchVotesByDate(value, label);
      
    }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='de'>
        <DatePicker 
            label={label}
            value={value}
            onChange={handleChangeValue}
            renderInput={(params) => <TextField {...params} size='small' />}
        />
    </LocalizationProvider>
  )
}
