"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Trash2, Plus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function CreateQuestion() {
  const router = useRouter();
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
      setTimeout(() => {
        router.push("/recruiter/questions");
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || "An error occurred" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/recruiter/questions" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} />
        Back to Library
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Coding Question</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Add a new problem to your assessment library.</p>
      </div>
      
      {message && (
        <div className={`p-4 mb-6 rounded-xl flex items-center border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-3 ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
              <input
                {...register("title", { required: true })}
                className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#0f172a] transition-all shadow-sm"
                placeholder="e.g. Two Sum"
              />
              {errors.title && <span className="text-rose-500 text-xs mt-1.5 font-medium block">Title is required</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Difficulty</label>
              <select
                {...register("difficulty")}
                className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#0f172a] transition-all shadow-sm appearance-none font-medium"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              {...register("description", { required: true })}
              rows={6}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#0f172a] transition-all shadow-sm resize-y"
              placeholder="Provide a detailed description of the problem, constraints, and examples..."
            />
            {errors.description && <span className="text-rose-500 text-xs mt-1.5 font-medium block">Description is required</span>}
          </div>
        </div>

        {/* Boilerplates */}
        <div className="bg-white dark:bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">Initial Boilerplate Code</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">This is the starter code the candidate will see.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> C++ Boilerplate
              </label>
              <textarea
                {...register("boilerplate.cpp")}
                rows={12}
                placeholder="#include <iostream>..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm min-h-[300px] focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Python Boilerplate
              </label>
              <textarea
                {...register("boilerplate.python")}
                rows={12}
                placeholder="def solve():..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm min-h-[300px] focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> JavaScript Boilerplate
              </label>
              <textarea
                {...register("boilerplate.javascript")}
                rows={12}
                placeholder="function solve() {..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm min-h-[300px] focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="bg-white dark:bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Test Cases</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define the inputs and expected outputs to evaluate candidate code.</p>
            </div>
            <button
              type="button"
              onClick={() => append({ input: "", expectedOutput: "", isHidden: false })}
              className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl transition-all shadow-sm font-semibold text-sm whitespace-nowrap"
            >
              <Plus size={16} /> Add Test Case
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-5 md:p-6 bg-slate-50/50 dark:bg-[#070b14]/50 rounded-xl border border-slate-200 dark:border-white/10 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Test Case {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                    title="Remove Test Case"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Input</label>
                    <textarea
                      {...register(`testCases.${index}.input`, { required: true })}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all shadow-inner"
                      placeholder="e.g. [2,7,11,15]\n9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Expected Output</label>
                    <textarea
                      {...register(`testCases.${index}.expectedOutput`, { required: true })}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all shadow-inner"
                      placeholder="e.g. [0,1]"
                    />
                  </div>
                </div>
                
                <div className="mt-5 flex items-center bg-white dark:bg-[#0f172a] p-3 border border-slate-200 dark:border-white/10 rounded-lg w-fit transition-colors">
                  <div className="flex items-center">
                    <input
                      id={`hidden-${index}`}
                      type="checkbox"
                      {...register(`testCases.${index}.isHidden`)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-600/20 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor={`hidden-${index}`} className="ml-2.5 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      Hide from candidate
                    </label>
                  </div>
                </div>
              </div>
            ))}
            
            {fields.length === 0 && (
              <div className="text-center py-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 border-dashed rounded-xl transition-colors">
                <p className="text-slate-500 dark:text-slate-400 font-medium">No test cases added yet.</p>
                <button
                  type="button"
                  onClick={() => append({ input: "", expectedOutput: "", isHidden: false })}
                  className="mt-3 text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
                >
                  Add your first test case
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || fields.length === 0}
            className="flex items-center gap-2 bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Saving...
              </>
            ) : (
              "Save Question"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
