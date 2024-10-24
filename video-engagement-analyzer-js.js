// Video Engagement Analyzer
class VideoEngagementAnalyzer {
    constructor(data) {
        this.rawData = data;
        this.processedData = this.preprocessData(data);
    }

    preprocessData(data) {
        // Convert string dates to Date objects and ensure numerical values
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
            totalPlayTime: communityData.reduce((sum, row) => sum + row['Play Time (Min)'], 0)
        };

        metrics.clickRate = metrics.totalInvites ? (metrics.totalClicks / metrics.totalInvites * 100) : 0;
        metrics.playRate = metrics.totalClicks ? (metrics.totalPlays / metrics.totalClicks * 100) : 0;
        metrics.avgPlayTime = metrics.totalPlays ? (metrics.totalPlayTime / metrics.totalPlays) : 0;

        // Calculate stage breakdown
        metrics.stageBreakdown = this.calculateStageBreakdown(communityData);

        return metrics;
    }

    calculateStageBreakdown(data) {
        const stages = {};
        
        data.forEach(row => {
            if (!stages[row['Automation Stage']]) {
                stages[row['Automation Stage']] = {
                    invites: 0,
                    clicks: 0,
                    plays: 0,
                    playTime: 0,
                    count: 0
                };
            }
            
            const stage = stages[row['Automation Stage']];
            stage.invites += row['Invites'];
            stage.clicks += row['Clicks'];
            stage.plays += row['Plays'];
            stage.playTime += row['Play Time (Min)'];
            stage.count++;
        });

        // Calculate averages
        Object.keys(stages).forEach(stage => {
            const stageData = stages[stage];
            stageData.avgPlayTime = stageData.plays ? stageData.playTime / stageData.plays : 0;
        });

        return stages;
    }

    generateInsights(metrics) {
        const insights = [];

        // Engagement insights
        if (metrics.clickRate > 50) {
            insights.push(`Strong initial engagement with ${metrics.clickRate.toFixed(1)}% click rate`);
        } else if (metrics.clickRate < 30) {
            insights.push(`Opportunity to improve initial engagement (${metrics.clickRate.toFixed(1)}% click rate)`);
        }

        // Watch time insights
        if (metrics.avgPlayTime > 5) {
            insights.push(`Excellent average watch time of ${metrics.avgPlayTime.toFixed(1)} minutes`);
        }

        // Stage performance insights
        const stages = Object.entries(metrics.stageBreakdown);
        const bestStage = stages.reduce((best, current) => 
            current[1].plays > best[1].plays ? current : best
        );
        insights.push(`Strongest performance in ${bestStage[0]} stage`);

        return insights;
    }

    generateStrategies(metrics) {
        const strategies = [];

        // Low click rate strategies
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

        // Low play rate strategies
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

        // Short watch time strategies
        if (metrics.avgPlayTime < 3) {
            strategies.push({
                focus: 'Extend Watch Time',
                actions: [
                    'Add chapter markers for longer videos',
                    'Include interactive elements at key dropoff points',
                    'Create shorter, more focused video content',
                    'Add compelling calls-to-action throughout'
                ]
            });
        }

        return strategies;
    }

    calculateMonthlyTrends() {
        const monthlyData = {};

        this.processedData.forEach(row => {
            const monthKey = row['Tracking Date Formatted'].toISOString().slice(0, 7);
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    invites: 0,
                    clicks: 0,
                    plays: 0,
                    playTime: 0,
                    count: 0
                };
            }

            const month = monthlyData[monthKey];
            month.invites += row['Invites'];
            month.clicks += row['Clicks'];
            month.plays += row['Plays'];
            month.playTime += row['Play Time (Min)'];
            month.count++;
        });

        // Calculate averages
        Object.keys(monthlyData).forEach(month => {
            const data = monthlyData[month];
            data.avgPlayTime = data.plays ? data.playTime / data.plays : 0;
        });

        return monthlyData;
    }

    analyze() {
        const communities = [...new Set(this.processedData.map(row => row['Community']))];
        const analysis = {
            communityInsights: {},
            followUpStrategies: {},
            monthlyTrends: this.calculateMonthlyTrends(),
            analysisDate: new Date().toISOString().slice(0, 10)
        };

        communities.forEach(community => {
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

    generateReport() {
        const analysis = this.analyze();
        const report = [];

        report.push('📊 VIDEO ENGAGEMENT ANALYSIS REPORT');
        report.push(`Generated on: ${analysis.analysisDate}\n`);

        Object.entries(analysis.communityInsights).forEach(([community, data]) => {
            report.push(`\n🏢 ${community}`);
            report.push('='.repeat(50));

            const { metrics } = data;
            report.push('\nKey Metrics:');
            report.push(`- Total Invites: ${metrics.totalInvites}`);
            report.push(`- Click Rate: ${metrics.clickRate.toFixed(1)}%`);
            report.push(`- Play Rate: ${metrics.playRate.toFixed(1)}%`);
            report.push(`- Average Watch Time: ${metrics.avgPlayTime.toFixed(1)} minutes`);

            report.push('\nKey Insights:');
            data.insights.forEach(insight => {
                report.push(`- ${insight}`);
            });

            if (analysis.followUpStrategies[community]) {
                report.push('\nRecommended Strategies:');
                analysis.followUpStrategies[community].forEach(strategy => {
                    report.push(`\n📌 ${strategy.focus}:`);
                    strategy.actions.forEach(action => {
                        report.push(`  • ${action}`);
                    });
                });
            }
        });

        report.push('\n📈 Monthly Trends');
        report.push('='.repeat(50));
        report.push(JSON.stringify(analysis.monthlyTrends, null, 2));

        return report.join('\n');
    }
}

// Example usage:
/*
// For browser:
const fileInput = document.getElementById('csvFileInput');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const data = parseCSV(text); // You'll need a CSV parser
    const analyzer = new VideoEngagementAnalyzer(data);
    const report = analyzer.generateReport();
    console.log(report);
});

// For Node.js:
const csv = require('csv-parser');
const fs = require('fs');
const results = [];

fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        const analyzer = new VideoEngagementAnalyzer(results);
        const report = analyzer.generateReport();
        console.log(report);
    });
*/
