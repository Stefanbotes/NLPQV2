// Client component for the Leadership Personas Assessment - Exact Clone
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  BarChart3,
  Trophy,
  Star,
  TrendingUp,
  Download,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  order: number;
  domain: string;
  schema: string;
  persona: string;
  healthyPersona: string;
  statement: string;
  type: string;
}

interface Response {
  value: number;
  timestamp: string;
}

interface BioData {
  name: string;
  email: string;
  team: string;
  uniqueCode: string;
}



export function AssessmentClient() {
  // Session and routing
  const { data: session } = useSession() || {};
  const router = useRouter();

  // State Management
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [bioData, setBioData] = useState<BioData>({
    name: '',
    email: '',
    team: '',
    uniqueCode: crypto.randomUUID()
  });
  const [bioCompleted, setBioCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});

  // Pre-populate bio data from session
  useEffect(() => {
    if (session?.user) {
      setBioData(prev => ({
        ...prev,
        name: prev.name || `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim(),
        email: prev.email || session.user.email || ''
      }));
    }
  }, [session]);
  
  const questionsPerPage = 5;

  const likertOptions = [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Slightly Disagree" },
    { value: 4, label: "Slightly Agree" },
    { value: 5, label: "Agree" },
    { value: 6, label: "Strongly Agree" }
  ];

  // Fisher-Yates shuffle algorithm for randomizing question order
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const response = await fetch('/api/assessment/questions');
        
        if (!response.ok) {
          throw new Error('Failed to load questions');
        }

        const data = await response.json();
        
        if (data.success && data.questions) {
          // Randomize questions once per session
          const shuffledQuestions = shuffleArray(data.questions as Question[]);
          setQuestions(shuffledQuestions);
          console.log(`Loaded and randomized ${shuffledQuestions.length} questions from database`);
        } else {
          throw new Error('Invalid questions data received');
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('Failed to load assessment questions. Please refresh the page.');
      } finally {
        setQuestionsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Handle response selection
  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: {
          value,
          timestamp: new Date().toISOString()
        }
      };

      const totalQuestions = questions?.length ?? 0;
      const answeredQuestions = Object.keys(newResponses)?.length ?? 0;
      setProgress((answeredQuestions / totalQuestions) * 100);

      return newResponses;
    });
  };

  // Handle bio data changes
  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBioData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bio form submission
  const handleBioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bioData?.name && bioData?.email && bioData?.team) {
      setBioCompleted(true);
      toast.success('Personal information saved. Starting assessment...');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  // Calculate category scores for results
  const calculateCategoryScores = (): Record<string, number> => {
    const categoryTotals: Record<string, { total: number; count: number }> = {};

    // Group responses by category
    questions.forEach(question => {
      if (question.schema && responses[question.id]) {
        if (!categoryTotals[question.schema]) {
          categoryTotals[question.schema] = { total: 0, count: 0 };
        }
        categoryTotals[question.schema].total += responses[question.id].value;
        categoryTotals[question.schema].count += 1;
      }
    });

    // Calculate averages
    const categoryScores: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([category, data]) => {
      categoryScores[category] = data.total / data.count;
    });

    return categoryScores;
  };

  // Submit assessment
  const handleSubmit = async () => {
    try {
      const scores = calculateCategoryScores();
      setCategoryScores(scores);
      
      // Find highest scoring category for primary result
      const topCategory = Object.entries(scores).reduce((a, b) => 
        scores[a[0]] > scores[b[0]] ? a : b
      );
      
      // Save to database via API endpoint
      const submissionData = {
        bioData,
        responses,
        categoryScores: scores,
        topCategory: topCategory[0],
        topScore: topCategory[1],
        completedAt: new Date().toISOString()
      };

      console.log('Submitting assessment data:', {
        responseCount: Object.keys(responses).length,
        topCategory: topCategory[0],
        topScore: topCategory[1].toFixed(2)
      });

      // Submit to database
      const submitResponse = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save assessment');
      }

      const result = await submitResponse.json();
      console.log('Assessment saved successfully:', result);

      // Show results and auto-download Tier 1 summary report
      setIsSubmitted(true);
      setShowResults(true);
      toast.success('Assessment completed and saved successfully!');
      
      // Auto-generate and download Tier 1 summary report
      setTimeout(() => {
        handleDownloadReport();
      }, 1000); // Small delay to let the success message show
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error(`Failed to submit assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Download Tier 1 Summary Report (Auto-generated)
  const handleDownloadReport = async () => {
    try {
      toast.loading('Generating your leadership summary...');
      
      const reportData = {
        responses,
        participantData: bioData,
        assessmentId: `assess_${Date.now()}`
      };

      const response = await fetch('/api/reports/generate-tier1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary report');
      }

      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Leadership_Summary_${bioData.name?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('Leadership summary downloaded successfully!');
      
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error('Failed to download report. Please try again.');
    }
  };

  // Navigation functions
  const handleNext = () => {
    const currentQuestions = getCurrentPageQuestions();
    const unanswered = currentQuestions.filter(q => !responses[q.id]);
    
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions on this page (${unanswered.length} remaining)`);
      return;
    }
    
    if (currentPage < Math.ceil(questions.length / questionsPerPage) - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return questions.slice(startIndex, endIndex);
  };

  const isLastPage = currentPage === Math.ceil(questions.length / questionsPerPage) - 1;
  const isFirstPage = currentPage === 0;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const answeredOnCurrentPage = getCurrentPageQuestions().filter(q => responses[q.id]).length;
  const totalOnCurrentPage = getCurrentPageQuestions().length;

  // Loading screen for questions
  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Card className="bg-white shadow-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Assessment</h3>
            <p className="text-gray-500">Preparing your 108-question leadership assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bio data collection screen
  if (!bioCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AnimatedLogo />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-700">
                Personal Information
              </CardTitle>
              <CardDescription>
                Please provide your details to begin the Leadership Personas Assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBioSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={bioData.name}
                    onChange={handleBioChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={bioData.email}
                    onChange={handleBioChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team">Team/Organization *</Label>
                  <Input
                    id="team"
                    name="team"
                    value={bioData.team}
                    onChange={handleBioChange}
                    placeholder="Enter your team or organization"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  Begin Assessment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">
                Assessment Complete!
              </CardTitle>
              <CardDescription>
                Here are your top leadership personas based on your responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Hello {bioData.name} from {bioData.team}
                </h3>
                <p className="text-gray-600">
                  Based on your {questions.length} responses, here are your leadership schema patterns:
                </p>
              </div>

              {Object.entries(categoryScores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, score], index) => (
                  <Card key={category} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg text-blue-700 capitalize">
                              {category.replace(/_/g, ' ')}
                            </CardTitle>
                            <CardDescription className="font-medium text-blue-600">
                              Leadership Schema Pattern
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round((score / 6) * 100)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            Score: {score.toFixed(1)}/6.0
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        <strong>Category:</strong> {category.replace(/_/g, ' ')} pattern shows a {score >= 4.5 ? 'strong' : score >= 3.0 ? 'moderate' : 'low'} activation level.
                      </p>
                    </CardContent>
                  </Card>
                ))}

              <div className="flex justify-center space-x-4 mt-8">
                <Button
                  onClick={() => {
                    setShowResults(false);
                    setIsSubmitted(false);
                    setBioCompleted(false);
                    setCurrentPage(0);
                    setResponses({});
                    setProgress(0);
                  }}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  variant="outline" 
                  className="flex items-center space-x-2 bg-green-50 border-green-200 hover:bg-green-100"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Assessment questions screen
  const currentQuestions = getCurrentPageQuestions();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl font-bold text-blue-700">
                Leadership Personas Assessment
              </CardTitle>
              <div className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress: {Math.round(progress)}% complete</span>
                <span>{Object.keys(responses).length} of {questions.length} answered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentQuestions.map((question, index) => (
              <Card key={question.id} className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">
                    {question.order}. {question.statement}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={responses[question.id]?.value?.toString() || ""}
                    onValueChange={(value) => handleResponse(question.id, parseInt(value))}
                  >
                    <div className="grid grid-cols-6 gap-3">
                      {likertOptions.map((option) => (
                        <div key={option.value} className="flex flex-col items-center space-y-2">
                          <RadioGroupItem
                            value={option.value.toString()}
                            id={`${question.id}-${option.value}`}
                            className="scale-125"
                          />
                          <Label
                            htmlFor={`${question.id}-${option.value}`}
                            className="text-xs text-center leading-tight cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                onClick={handlePrevious}
                disabled={isFirstPage}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="text-sm text-gray-600">
                {answeredOnCurrentPage} of {totalOnCurrentPage} answered on this page
              </div>

              {isLastPage ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(responses).length !== questions.length}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Assessment</span>
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={answeredOnCurrentPage !== totalOnCurrentPage}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}