"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Trash2, Plus, Loader2 } from "lucide-react";

type TestCase = {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

type FormData = {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  boilerplate: {
    cpp: string;
    python: string;
    javascript: string;
  };
  testCases: TestCase[];
};

export default function AdminDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
      boilerplate: {
        cpp: "",
        python: "",
        javascript: ""
      },
      testCases: [{ input: "", expectedOutput: "", isHidden: false }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "testCases"
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/db/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to create question");
      }

      setMessage({ type: 'success', text: "Question added successfully!" });
      reset();
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-emerald-400 tracking-tight">Recruiter Dashboard</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded-xl flex items-center ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/50 text-rose-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl space-y-5">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <input
                {...register("title", { required: true })}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
                placeholder="e.g. Two Sum"
              />
              {errors.title && <span className="text-rose-400 text-xs mt-1 block">Title is required</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                {...register("description", { required: true })}
                rows={5}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner resize-y"
                placeholder="Problem description..."
              />
              {errors.description && <span className="text-rose-400 text-xs mt-1 block">Description is required</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
              <select
                {...register("difficulty")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner appearance-none"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          {/* Boilerplates */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl space-y-5">
            <h2 className="text-xl font-semibold">Boilerplate Code</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">C++ Boilerplate</label>
              <textarea
                {...register("boilerplate.cpp")}
                rows={4}
                placeholder="#include <iostream>..."
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Python Boilerplate</label>
              <textarea
                {...register("boilerplate.python")}
                rows={4}
                placeholder="def solve():..."
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">JavaScript Boilerplate</label>
              <textarea
                {...register("boilerplate.javascript")}
                rows={4}
                placeholder="function solve() {..."
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
              />
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Test Cases</h2>
              <button
                type="button"
                onClick={() => append({ input: "", expectedOutput: "", isHidden: false })}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 px-4 py-2 rounded-xl transition shadow-sm font-medium text-sm"
              >
                <Plus size={16} /> Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-5 bg-gray-900/80 rounded-xl border border-gray-700/80 relative group shadow-inner">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition"
                    title="Remove Test Case"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <h3 className="text-sm font-semibold text-emerald-500/70 mb-4 uppercase tracking-wider">Test Case {index + 1}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">Input</label>
                      <textarea
                        {...register(`testCases.${index}.input`, { required: true })}
                        rows={3}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">Expected Output</label>
                      <textarea
                        {...register(`testCases.${index}.expectedOutput`, { required: true })}
                        rows={3}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register(`testCases.${index}.isHidden`)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded border border-gray-600 bg-gray-950 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center transition">
                        <svg className="w-3 h-3 text-gray-900 opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-400 peer-checked:text-gray-200 transition">
                        Hidden Test Case (Not visible to candidate)
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-emerald-500 text-gray-950 font-bold text-lg py-4 px-6 rounded-2xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={24} /> Processing...
              </>
            ) : (
              "Add Coding Question"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
