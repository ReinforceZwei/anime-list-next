import { FormState } from "react-hook-form";
import { FormValues } from "../EditAnimeModal";
import { DateTime } from "luxon";



export default function updateFinishTimeOnStatusChange(data: FormValues, formState: FormState<FormValues>): FormValues {
    if (formState.dirtyFields.status) {
        if (data.status === 'finished') {
            return {
                ...data,
                finish_time: DateTime.now().toUTC().toISO(),
            }
        }
        // Remove finish time for other status, except 'abandon'
        if (data.status !== 'abandon') {
            return {
                ...data,
                finish_time: '',
            }
        }
    }
    return data
}