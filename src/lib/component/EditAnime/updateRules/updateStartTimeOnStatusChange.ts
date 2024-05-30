import { FormState } from "react-hook-form";
import { FormValues } from "../EditAnimeModal";
import { DateTime } from "luxon";



export default function updateStartTimeOnStatusChange(data: FormValues, formState: FormState<FormValues>): FormValues {
    if (formState.dirtyFields.status) {
        if (data.status === 'in-progress') {
            return {
                ...data,
                start_time: DateTime.now().toUTC().toISO(),
            }
        }
        if (data.status === 'pending') {
            return {
                ...data,
                start_time: '',
            }
        }
    }
    return data
}