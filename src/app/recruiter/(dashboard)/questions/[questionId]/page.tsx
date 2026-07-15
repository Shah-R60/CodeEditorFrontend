"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Trash2, Plus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

export default function EditQuestion() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.questionId as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${apiUrl}/db/questions/${questionId}`);
        const json = await response.json();
        
        if (json.success && json.data) {
          const q = json.data;
          reset({
            title: q.title,
            description: q.description,
            difficulty: q.difficulty as any,
            boilerplate: {
              cpp: q.boilerplate?.cpp || "",
              python: q.boilerplate?.python || "",
              javascript: q.boilerplate?.javascript || ""
            },
            testCases: q.testCases?.length > 0 ? q.testCases.map((tc: any) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden
            })) : [{ input: "", expectedOutput: "", isHidden: false }]
          });
        } else {
          setMessage({ type: 'error', text: "Question not found." });
        }
      } catch (err) {
        setMessage({ type: 'error', text: "Error fetching question." });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (questionId) fetchQuestion();
  }, [questionId, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/db/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      setMessage({ type: 'success', text: "Question updated successfully!" });
      setTimeout(() => {
        router.push("/recruiter/questions");
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || "An error occurred" });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/recruiter/questions" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} />
        Back to Library
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Question</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Update the details of your coding question.</p>
      </div>
      
      {message && (
        <div className={`p-4 mb-6 rounded-xl flex items-center border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white dark:bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6 transition-colors">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Question Title</label>
                <input 
                  {...register("title", { required: "Title is required" })}
                  className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#0f172a] transition-all"
                  placeholder="e.g. Two Sum"
                />
                {errors.title && <span className="text-rose-500 text-xs">{errors.title.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Difficulty</label>
                <select 
                  {...register("difficulty")}
                  className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#0f172a] transition-all"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Description & Instructions</label>
            <textarea 
              {...register("description", { required: "Description is required" })}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white min-h-[150px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#0f172a] transition-all"
              placeholder="Describe the problem, input format, output format, and constraints..."
            />
            {errors.description && <span className="text-rose-500 text-xs">{errors.description.message}</span>}
          </div>
        </div>

        {/* Code Templates */}
        <div className="bg-white dark:bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6 transition-colors">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Code Templates (Optional)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Provide starting boilerplate code for the candidates.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-20">Python</span>
              </label>
              <textarea 
                {...register("boilerplate.python")}
                className="w-full bg-[#1e1e1e] text-slate-300 font-mono text-sm border-0 rounded-xl px-4 py-3 min-h-[300px] focus:ring-2 focus:ring-emerald-500"
                placeholder="def solve(nums):&#10;    pass"
                rows={12}
                spellCheck={false}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-20">JavaScript</span>
              </label>
              <textarea 
                {...register("boilerplate.javascript")}
                className="w-full bg-[#1e1e1e] text-slate-300 font-mono text-sm border-0 rounded-xl px-4 py-3 min-h-[300px] focus:ring-2 focus:ring-emerald-500"
                placeholder="function solve(nums) {&#10;    // write code here&#10;}"
                rows={12}
                spellCheck={false}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-20">C++</span>
              </label>
              <textarea 
                {...register("boilerplate.cpp")}
                className="w-full bg-[#1e1e1e] text-slate-300 font-mono text-sm border-0 rounded-xl px-4 py-3 min-h-[300px] focus:ring-2 focus:ring-emerald-500"
                placeholder="#include <iostream>&#10;using namespace std;&#10;&#10;void solve() {&#10;    // write code here&#10;}"
                rows={12}
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="bg-white dark:bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Test Cases</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add inputs and expected outputs.</p>
            </div>
            <button 
              type="button"
              onClick={() => append({ input: "", expectedOutput: "", isHidden: false })}
              className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold py-2 px-4 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-sm"
            >
              <Plus size={16} /> Add Test Case
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-white/10 relative group">
                <div className="absolute top-4 right-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input 
                      type="checkbox"
                      {...register(`testCases.${index}.isHidden`)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    Hidden Case
                  </label>
                  <button 
                    type="button"
                    onClick={() => remove(index)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="font-semibold text-slate-900 dark:text-slate-300 mb-4">Test Case {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 block">Input</label>
                    <textarea 
                      {...register(`testCases.${index}.input`, { required: true })}
                      className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-300 min-h-[80px] font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. nums = [2,7,11,15], target = 9"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 block">Expected Output</label>
                    <textarea 
                      {...register(`testCases.${index}.expectedOutput`, { required: true })}
                      className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-300 min-h-[80px] font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. [0,1]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link 
            href="/recruiter/questions"
            className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
