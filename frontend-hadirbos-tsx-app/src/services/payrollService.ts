import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const getPayroll = async (token: string, month: number, year: number) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const response = await axios.get(`${BASE_URL}/payroll?month=${month}&year=${year}`, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch payroll");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getPayrollById = async (id: string | undefined, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const response = await axios.get(`${BASE_URL}/payroll/${id}`, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch payroll");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const getPayrollByEmployeeId = async (token: string, employeeId: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const response = await axios.get(`${BASE_URL}/payroll/employee/${employeeId}`, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch payroll");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const processPayment = async (id: string | undefined, paymentPayload: {
    status: string,
    paymentMethod?: string,
    paymentReference?: string,
    paymentDate?: Date,
    notes?: string
}, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const response = await axios.patch(`${BASE_URL}/payroll/${id}/payment`, paymentPayload, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch payroll");
        }
        throw new Error("An unexpected error occurred");
    }
}

type PayrollData = {
    deductions: number,
    bonus: number,
    tax: number,
    paymentMethod: string,
    paymentDate: Date,
    notes: string,
    paymentReference: string,
}

export const updatePayroll = async (id: string | undefined, payrollPayload: Partial<PayrollData>, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        return await axios.put(`${BASE_URL}/payroll/${id}`, payrollPayload, config);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch payroll");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const getPayrollStats = async (token: string, month?: number, year?: number, period?: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const params = new URLSearchParams();
    if (month !== undefined) params.append("month", month.toString());
    if (year !== undefined) params.append("year", year.toString());
    if (period) params.append("period", period);

    try {
        const response = await axios.get(`${BASE_URL}/payroll/stats?${params.toString()}`, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch payroll");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const getPayrollTrend = async (token: string, month?: number, year?: number, period?: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const params = new URLSearchParams();
    if (month !== undefined) params.append("month", month.toString());
    if (year !== undefined) params.append("year", year.toString());
    if (period) params.append("period", period);

    try {
        const response = await axios.get(`${BASE_URL}/payroll/trend?${params.toString()}`, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch payroll");
        }
        throw new Error("An unexpected error occurred");
    }
}