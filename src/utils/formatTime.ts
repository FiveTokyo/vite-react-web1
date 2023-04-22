import dayjs from "dayjs";

export function formatTime(time?: string | Date | dayjs.Dayjs | null | undefined) {
    if(time === undefined) return dayjs().format('YYYY-MM-DD HH:mm:ss')
    if(!time) return '-'
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}


export function formatDate(time?: string | Date | dayjs.Dayjs | null | undefined) {
    if(time === undefined) return dayjs().format('YYYY-MM-DD')
    if(!time) return '-'
    return dayjs(time).format('YYYY-MM-DD')
}