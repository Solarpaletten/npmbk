// src/pages/Bank/BankOperations/components/BankOperationEditForm/index.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Page from "../../../../components/Page";
import { Form } from "../../../../components/Modal";
import Field from "../../../../components/Field";
import { useBankOperations } from "../../../../contexts/BankOperationsContext";
import { useAuthenticatedApi } from "../../../../utils/api";

const BankOperationEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAuthenticatedApi();
  const { refetch } = useBankOperations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "D",
    amount: "",
    client: "",
    description: "",
    account: "271",
    corresponding_account: "",
    reference_number: "",
    initial_client: "",
    initial_customer_code: "",
    transfer_no: ""
  });

  useEffect(() => {
    const fetchOperation = async () => {
      try {
        const response = await api.get(`/bank/operations/${id}`);
        setFormData(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch operation");
      }
    };

    fetchOperation();
  }, [id, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.put(`/bank/operations/${id}`, formData);
      await refetch();
      navigate("/bank/operations");
    } catch (err) {
      setError(err.message || "Failed to update operation");
      setLoading(false);
    }
  };

  return (
    <Page>
      <Form
        onSubmit={handleSubmit}
        onClose={() => navigate("/bank/operations")}
        loading={loading}
        error={error}
        buttonPositiveName="Save changes"
        buttonNegativeName="Cancel"
      >
        <h2>Edit bank operation</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Accounting bank"
            type="text"
            name="accounting_bank"
            value="AG"
            disabled
            required
          />
          
          <Field
            label="Cor. account"
            type="text"
            name="account"
            value={formData.account}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Field
            label="C/D"
            type="select"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={loading}
            required
            options={[
              { value: "D", label: "Debit" },
              { value: "K", label: "Credit" }
            ]}
          />

          <Field
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Field
            label="Transfer no."
            type="text"
            name="transfer_no"
            value={formData.transfer_no}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Field
            label="Total"
            type="number"
            step="0.01"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Field
            label="Initial client"
            type="text"
            name="initial_client"
            value={formData.initial_client}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Field
            label="Initial customer code"
            type="text"
            name="initial_customer_code"
            value={formData.initial_customer_code}
            onChange={handleChange}
            disabled={loading}
          />

          <Field
            label="Client"
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Field
            label="Description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
          />

          <Field
            label="Reference number"
            type="text"
            name="reference_number"
            value={formData.reference_number}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </Form>
    </Page>
  );
};

export default BankOperationEditForm;