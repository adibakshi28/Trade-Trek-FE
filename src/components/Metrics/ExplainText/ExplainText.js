import React from 'react';
import { Card, CardContent, Typography, Divider, Skeleton } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import './ExplainText.css';

const ExplainText = ({ replyText, loading }) => {
  return (
    <Card className="itd-card">
      <CardContent className="itd-card-content">
        <Typography variant="h6" className="itd-title">
            Analysis Report & Recommendations
        </Typography>
        <Divider className="itd-divider" />
        {loading ? (
          <div className="skeleton-wrapper">
            <Skeleton variant="rectangular" height={50} width="50%" className="skeleton-title" />
            <Skeleton variant="rectangular" height={25} width="80%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="90%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="70%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="60%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="80%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="90%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="70%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="60%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="80%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="90%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="70%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="60%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="80%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="90%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="70%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="60%" className="skeleton-line" />
            <Skeleton variant="rectangular" height={25} width="80%" className="skeleton-line" />
          </div>
        ) : (
          <div className="itd-markdown">
            <ReactMarkdown>{replyText}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExplainText;
