"use client";

import React from "react";
import { FieldArray } from "formik";
import { TextField, Button } from "@mui/material";

export interface CrosswordItem {
  word: string;
  clue: string;
}

interface CrosswordFormValues {
  rows?: number | "";
  cols?: number | "";
  crosswordItems: CrosswordItem[];
}

interface CrosswordItemError {
  word?: string;
  clue?: string;
}

interface CrosswordItemTouched {
  word?: boolean;
  clue?: boolean;
}

interface CrosswordFieldsProps {
  values: CrosswordFormValues;
  errors: {
    rows?: string;
    cols?: string;
    crosswordItems?: CrosswordItemError[];
  };
  touched: {
    rows?: boolean;
    cols?: boolean;
    crosswordItems?: CrosswordItemTouched[];
  };
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleBlur: React.FocusEventHandler<HTMLInputElement>;
}

const CrosswordFields: React.FC<CrosswordFieldsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}) => {
  const crosswordItems = values.crosswordItems ?? [];

  return (
    <>
      <div className="mb-4 flex gap-4">
        <TextField
          name="rows"
          label="Linhas"
          variant="outlined"
          value={values.rows ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(touched.rows && errors.rows)}
          helperText={touched.rows && errors.rows}
          fullWidth
          type="number"
        />
        <TextField
          name="cols"
          label="Colunas"
          variant="outlined"
          value={values.cols ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(touched.cols && errors.cols)}
          helperText={touched.cols && errors.cols}
          fullWidth
          type="number"
        />
      </div>

      <FieldArray name="crosswordItems">
        {({ push, remove }) => (
          <div className="mb-4">
            <p className="block font-medium mb-1">Palavras e Dicas</p>
            {crosswordItems.map((item, index) => (
              <div
                key={index}
                className="border p-4 rounded mb-2 bg-gray-50 flex flex-col gap-2"
              >
                <TextField
                  name={`crosswordItems.${index}.word`}
                  label="Palavra"
                  variant="outlined"
                  value={item.word}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.crosswordItems?.[index]?.word && errors.crosswordItems?.[index]?.word)}
                  helperText={touched.crosswordItems?.[index]?.word && errors.crosswordItems?.[index]?.word}
                  fullWidth
                />
                <TextField
                  name={`crosswordItems.${index}.clue`}
                  label="Dica"
                  variant="outlined"
                  value={item.clue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.crosswordItems?.[index]?.clue && errors.crosswordItems?.[index]?.clue)}
                  helperText={touched.crosswordItems?.[index]?.clue && errors.crosswordItems?.[index]?.clue}
                  fullWidth
                />
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                >
                  Remover Item
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => push({ word: "", clue: "" })}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Adicionar Item
            </Button>
          </div>
        )}
      </FieldArray>
    </>
  );
};

export default CrosswordFields;