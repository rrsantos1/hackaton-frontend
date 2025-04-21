"use client";

import React from "react";
import { TextField } from "@mui/material";
import { FormikValues } from "formik";
import Image from "next/image";

interface CommonFieldsProps {
  values: FormikValues;
  errors: FormikValues;
  touched: FormikValues;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  setFieldValue: (field: string, value: string, shouldValidate?: boolean) => void;
  currentCover: string;
}

const CommonFields: React.FC<CommonFieldsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  currentCover,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <TextField
            name="title"
            label="Título"
            variant="outlined"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.title && errors.title)}
            helperText={touched.title && errors.title}
            fullWidth
          />
        </div>
        <div className="mb-4">
          <TextField
            name="category"
            label="Categoria"
            variant="outlined"
            value={values.category}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.category && errors.category)}
            helperText={touched.category && errors.category}
            fullWidth
          />
        </div>
      </div>  
      <div className="mb-4">
        <TextField
          name="description"
          label="Descrição"
          variant="outlined"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(touched.description && errors.description)}
          helperText={touched.description && errors.description}
          multiline
          rows={4}
          fullWidth
        />
      </div>      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium" htmlFor="coverImage">
          Imagem de Capa
        </label>
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          onChange={(event) => {
            if (event.currentTarget.files && event.currentTarget.files[0]) {
              setFieldValue("coverImage", URL.createObjectURL(event.currentTarget.files[0]));
            }
          }}
          className="w-full p-2 border rounded"
        />
        {touched.coverImage && errors.coverImage && (
          <div className="text-red-500 text-sm">{errors.coverImage}</div>
        )}
        {values.coverImage === null && currentCover && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Imagem Atual:</p>            
            <Image
              src={`http://localhost:3001${currentCover}`}
              alt="Capa atual"
              width={40}
              height={30}
              className="w-40 h-auto rounded"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CommonFields;