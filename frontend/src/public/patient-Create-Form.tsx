import React, { useState } from "react";
import { useParams } from "react-router-dom";

import {
    Box,
    Card,
    Stack,
    Button,
    TextField,
    CardHeader,
    Typography,
    CardContent,
} from "@mui/material";

import PatientService from "src/services/patient/patient.service";

type PatientFormValues = {
    firstname: string;
    lastname: string;
    // phone: string;
    email?: string;
    age: string | number;
    gender: string,
    description: string;
    caseId: string
};

export default function PatientUpdateForm() {
    const { patientId, caseId } = useParams<{ patientId: string; caseId: string }>();
    const [success, setSuccess] = useState(() =>
        // read from localStorage at mount
        localStorage.getItem(`updated_${patientId}_${caseId}`) === "true"
    );


    const [formValues, setFormValues] = useState<PatientFormValues>({
        firstname: "",
        lastname: "",
        // phone: "",
        email: "",
        age: "",
        gender: "",
        description: "",
        caseId: "",
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof PatientFormValues, string>>
    >({});

    const handleChange =
        (field: keyof PatientFormValues) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setFormValues({ ...formValues, [field]: event.target.value });
            };

    const validate = () => {
        const newErrors: Partial<Record<keyof PatientFormValues, string>> = {};
        if (!formValues.firstname || formValues.firstname.length < 2)
            newErrors.firstname = "First name is required";
        if (!formValues.lastname || formValues.lastname.length < 2)
            newErrors.lastname = "Last name is required";
        // if (!formValues.phone || formValues.phone.length < 10)
        //     newErrors.phone = "Phone number must be at least 10 digits";
        if (formValues.email && !/\S+@\S+\.\S+/.test(formValues.email))
            newErrors.email = "Invalid email address";
        if (!formValues.age || isNaN(Number(formValues.age)) || Number(formValues.age) <= 0)
            newErrors.age = "Age must be a valid number";
        if (!['male', 'female', 'others'].includes(formValues?.gender?.toLowerCase()))
            newErrors.gender = "gender must be one of them Male, Female and other";
        if (formValues.description && formValues.description.length < 2) {
            newErrors.description = "Description must be at least 2 characters";
        }
        return newErrors;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (patientId && caseId) {
                const age = typeof formValues.age === 'string' ? parseInt(formValues.age, 10) : formValues.age;
                const updatedData: PatientFormValues = {
                    ...formValues,
                    age,
                    caseId
                }
                const res = await PatientService.updatePatient(patientId as string, updatedData)

                if (Number(res.status) === 200) {
                    setSuccess(true);
                    localStorage.setItem(`updated_${patientId}_${caseId}`, "true");
                } else {
                    alert("Update failed.");
                }
            } else {
                alert('Patient and Case Ids required.');
            }


        } catch (error) {
            console.error("Error updating patient:", error);
            alert("Something went wrong");
        }
    };

    const handleCancel = () => {
        setFormValues({
            firstname: "",
            lastname: "",
            // phone: "",
            email: "",
            age: "",
            gender: "",
            description: "",
            caseId: ""
        });
        setErrors({});
    };

    return (
        <>
            {

                success ? (
                    <Typography variant="h6" align="center" color="green">
                        ✅ Patient information already updated. No need to update again.
                    </Typography>
                ) :
                    (<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.50" p={2}>
                        <Card sx={{ maxWidth: 600, width: "100%", borderRadius: 3, boxShadow: 4 }}>
                            <CardHeader
                                title={
                                    <Typography variant="h6" align="center">
                                        Update Patient Case
                                    </Typography>
                                }
                            />
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={3}>
                                        <TextField
                                            label="First Name"
                                            value={formValues.firstname}
                                            onChange={handleChange("firstname")}
                                            error={!!errors.firstname}
                                            helperText={errors.firstname}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Last Name"
                                            value={formValues.lastname}
                                            onChange={handleChange("lastname")}
                                            error={!!errors.lastname}
                                            helperText={errors.lastname}
                                            fullWidth
                                            required
                                        />
                                        {/* <TextField
                                label="Phone"
                                value={formValues.phone}
                                onChange={handleChange("phone")}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                fullWidth
                                required
                            /> */}
                                        <TextField
                                            label="Email (optional)"
                                            value={formValues.email}
                                            onChange={handleChange("email")}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            fullWidth
                                        />
                                        <TextField
                                            label="Age"
                                            value={formValues.age}
                                            onChange={handleChange("age")}
                                            error={!!errors.age}
                                            helperText={errors.age}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Gender"
                                            value={formValues.gender}
                                            onChange={handleChange("gender")}
                                            error={!!errors.gender}
                                            helperText={errors.gender}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Description"
                                            value={formValues.description}
                                            onChange={handleChange("description")}
                                            error={!!errors.description}
                                            helperText={errors.description}
                                            fullWidth
                                            multiline
                                            rows={4}
                                        />
                                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                            <Button variant="outlined" color="secondary" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="contained" color="primary">
                                                Update
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </form>
                            </CardContent>
                        </Card>
                    </Box>)
            }
        </>
    );
}
