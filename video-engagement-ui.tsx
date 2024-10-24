import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Upload } from 'lucide-react';

// Define VideoEngagementAnalyzer class
const VideoEngagementAnalyzer = class {
  rawData: any;
  processedData: any;

  constructor(data) {
    this.rawData = data;
    this.processedData = this.preprocessData(data);
  }

  preprocessData(data) {
    return data.map(row => ({
      ...row,
      'Tracking Date Formatted': new Date(row['Tracking Date Formatted']),
      'Invites': Number(row['Invites']) || 0,
      'Clicks': Number(row['Clicks']) || 0,
      'Plays': Number(row['Plays']) || 0,
      'Play Time (Min)': Number(row['Play Time (Min)']) || 0
    }));
  }

  calculateCommunityMetrics(communityData) {
    const metrics = {
      totalInvites: communityData.reduce((sum, row) => sum + row['Invites'], 0),
      totalClicks: communityData.reduce((sum, row) => sum + row['Clicks'], 0),
      totalPlays: communityData.reduce((sum, row) => sum + row['Plays'], 0),
      totalPlayTime: communityData.reduce((sum, row) => sum + row['Play Time (Min)'], 0),
      clickRate: 0,
      playRate: 0,
      avgPlayTime: 0
    };

    metrics.clickRate = metrics.totalInvites ? (metrics.totalClicks / metrics.totalInvites * 100) : 0;
    metrics.playRate = metrics.totalClicks ? (metrics.totalPlays / metrics.totalClicks * 100) : 0;
    metrics.avgPlayTime = metrics.totalPlays ? (metrics.totalPlayTime / metrics.totalPlays) : 0;

    return metrics;
  }

  generateInsights(metrics): string[] {
    const insights: string[] = [];
    if (metrics.clickRate > 50) {
      insights.push(`Strong initial engagement with ${metrics.clickRate.toFixed(1)}% click rate`);
    } else if (metrics.clickRate < 30) {
      insights.push(`Opportunity to improve initial engagement (${metrics.clickRate.toFixed(1)}% click rate)`);
    }
    if (metrics.avgPlayTime > 5) {
      insights.push(`Excellent average watch time of ${metrics.avgPlayTime.toFixed(1)} minutes`);
    }
    return insights;
  }

  generateStrategies(metrics): { focus: string; actions: string[] }[] {
      const strategies: { focus: string; actions: string[] }[] = [];
    if (metrics.clickRate < 40) {
      strategies.push({
        focus: 'Improve Initial Engagement',
        actions: [
          'A/B test video thumbnail images',
          'Optimize video titles for clarity and impact',
          'Send invites during peak engagement hours',
          'Include personalized preview content in invitations'
        ]
      });
    }
    if (metrics.playRate < 70) {
      strategies.push({
        focus: 'Increase Play Rate',
        actions: [
          'Add social proof elements to landing pages',
          'Include video duration in preview',
          'Create stage-specific video content',
          'Implement one-click play functionality'
        ]
      });
    }
    return strategies;
  }

  analyze() {
    const communities = [...new Set(this.processedData.map(row => row['Community']))] as string[];
    const analysis: {
      communityInsights: { [key: string]: { metrics: any; insights: string[] } };
      followUpStrategies: { [key: string]: { focus: string; actions: string[] }[] };
      analysisDate: string;
    } = {
      communityInsights: {},
      followUpStrategies: {},
      analysisDate: new Date().toISOString().slice(0, 10)
    };

    communities.forEach((community: string) => {
      const communityData = this.processedData.filter(row => row['Community'] === community);
      const metrics = this.calculateCommunityMetrics(communityData);
      
      analysis.communityInsights[community] = {
        metrics: metrics,
        insights: this.generateInsights(metrics)
      };

      analysis.followUpStrategies[community] = this.generateStrategies(metrics);
    });

    return analysis;
  }
};

const VideoEngagementUI = () => {
  interface AnalysisResult {
    communityInsights: {
      [key: string]: {
        metrics: any;
        insights: string[];
      };
    };
    followUpStrategies: {
      [key: string]: {
        focus: string;
        actions: string[];
      }[];
    };
    analysisDate: string;
  }
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, ''));
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const text = await file.text();
        const data = parseCSV(text);
        const analyzer = new VideoEngagementAnalyzer(data);
        const report = analyzer.analyze();
        setAnalysisResult(report);
      } catch (error) {
        console.error('Error analyzing file:', error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Engagement Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file with video engagement data</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">Analyzing data...</div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-4">
          {Object.entries(analysisResult.communityInsights as { [key: string]: { metrics: any; insights: string[] } }).map(([community, data]) => (
            <Card key={community}>
              <CardHeader>
                <CardTitle>{community}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-sm text-blue-600">Total Invites</div>
                        <div className="text-xl font-bold">{data.metrics.totalInvites}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-sm text-green-600">Click Rate</div>
                        <div className="text-xl font-bold">{data.metrics.clickRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-sm text-purple-600">Play Rate</div>
                        <div className="text-xl font-bold">{data.metrics.playRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="text-sm text-orange-600">Avg Watch Time</div>
                        <div className="text-xl font-bold">{data.metrics.avgPlayTime.toFixed(1)}m</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Insights</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {data.insights.map((insight, i) => (
                        <li key={i} className="text-sm">{insight}</li>
                      ))}
                    </ul>
                  </div>

                  {analysisResult.followUpStrategies[community] && (
                    <div>
                      <h3 className="font-semibold mb-2">Recommended Strategies</h3>
                      <div className="space-y-3">
                        {analysisResult.followUpStrategies[community].map((strategy, i) => (
                          <div key={i} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium mb-2">{strategy.focus}</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {strategy.actions.map((action, j) => (
                                <li key={j} className="text-sm">{action}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoEngagementUI;
