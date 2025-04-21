"use client";

import React from "react";
import { FieldArray } from "formik";
import { TextField, Button } from "@mui/material";

interface Pair {
  word: string;
  translation: string;
}

interface MultipleChoiceFormValues {
  timeLimit?: number | "";
  pairs: Pair[];
}

interface PairError {
  word?: string;
  translation?: string;
}

interface PairTouched {
  word?: boolean;
  translation?: boolean;
}

interface MultipleChoiceFieldsProps {
  values: MultipleChoiceFormValues;
  errors: {
    timeLimit?: string;
    pairs?: PairError[];
  };
  touched: {
    timeLimit?: boolean;
    pairs?: PairTouched[];
  };
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleBlur: React.FocusEventHandler<HTMLInputElement>;
}

const MultipleChoiceFields: React.FC<MultipleChoiceFieldsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}) => {
  return (
    <>
      <div className="mb-4">
        <TextField
          name="timeLimit"
          label="Tempo limite (minutos)"
          variant="outlined"
          value={values.timeLimit ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(touched.timeLimit && errors.timeLimit)}
          helperText={touched.timeLimit && errors.timeLimit}
          fullWidth
          type="number"
        />
      </div>
      <FieldArray name="pairs">
        {({ push, remove }) => (
          <div className="mb-4">
            <p className="block font-medium mb-1">Pares</p>
            {values.pairs.map((pair, index) => (
              <div
                key={index}
                className="border p-4 rounded mb-2 bg-gray-50"
              >
                <div className="mb-2">
                  <TextField
                    name={`pairs.${index}.word`}
                    label="Palavra"
                    variant="outlined"
                    value={pair.word}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.pairs?.[index]?.word && errors.pairs?.[index]?.word)}
                    helperText={touched.pairs?.[index]?.word && errors.pairs?.[index]?.word}
                    fullWidth
                  />
                </div>
                <div className="mb-2">
                  <TextField
                    name={`pairs.${index}.translation`}
                    label="Tradução"
                    variant="outlined"
                    value={pair.translation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.pairs?.[index]?.translation && errors.pairs?.[index]?.translation)}
                    helperText={touched.pairs?.[index]?.translation && errors.pairs?.[index]?.translation}
                    fullWidth
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                >
                  Remover Par
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => push({ word: "", translation: "" })}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Adicionar Par
            </Button>
          </div>
        )}
      </FieldArray>
    </>
  );
};

export default MultipleChoiceFields;