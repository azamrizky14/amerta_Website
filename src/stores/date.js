import { format } from 'date-fns';


// Others
export const getDateToday = async (formatDate) => {
    
const today = format(new Date(), formatDate);
return today
}