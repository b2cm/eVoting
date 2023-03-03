import 'dayjs/locale/de';
import { 
    TextField,
 } from '@mui/material';
import {AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
    DateTimePicker,
    LocalizationProvider
} from '@mui/x-date-pickers';
import { 
    grey,
} from '@mui/material/colors';

export default function MyDateTimePicker(props) {
    const { isEditable, value, label, setValue } = props;
    const inputBackgroundColor = grey[50]; // #FAFAFA

    const inputBackgroundColorHover = '#F7F7F7';
    const borderColor = '#0000009E';

    const handleChangeDateTime = (value) => {
        setValue(value);
    }
    
    
  return (

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='de'>
            <DateTimePicker
                disabled={!isEditable}
                inputFormat='dd, DD MMM YYYY, HH:mm'
                disableMaskedInput
                label={label}
                value={value}
                disablePast
                onChange={newValue => {
                    handleChangeDateTime(newValue);
                }}
                renderInput={props => <TextField required 
                    size='small' 
                    {...props}
                    //inputProps={{ style: { WebkitTextFillColor: textColor, } }}
                sx={{
                    width:1/2, 
                    borderColor: borderColor,
                    backgroundColor: inputBackgroundColor,
                    ":hover": {
                        backgroundColor: inputBackgroundColorHover,
                    }, 
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            height: 35,
                            border: 'solid 1px',
                            borderLeft: 'none',
                            borderRadius:0,
                            fontSize:30,
                            borderColor: borderColor
                            //backgroundColor: inputBackgroundColorHover
                        },
                        '&:hover fieldset': {
                            //border: 'solid 1px',
                            //borderColor: 'blue',
                           //backgroundColor: inputBackgroundColorHover
                        },
                    },
                    "& .MuiOutlinedInput-input": {
                        //color: "red",
                        fontSize: 12
                    }
               }} 
             />}
            />
    </LocalizationProvider>

  )
}
