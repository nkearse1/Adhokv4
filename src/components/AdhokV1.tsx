import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNowStrict, isBefore } from "date-fns";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";

export default function AdhokV1() {
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState({});
  const [bidErrors, setBidErrors] = useState({});
  const [newProject, setNewProject] = useState({ title: "", description: "", deadline: "", minHours: "" });
  const [filter, setFilter] = useState("");
  const [authUser, setAuthUser] = useState("");

  const handlePostProject = () => {
    if (newProject.title && newProject.description && newProject.deadline && newProject.minHours) {
      const projectWithId = {
        ...newProject,
        id: Date.now(),
        bids: [],
        deadline: new Date(newProject.deadline),
        minHours: parseFloat(newProject.minHours),
      };
      setProjects([...projects, projectWithId]);
      setNewProject({ title: "", description: "", deadline: "", minHours: "" });
      toast.success("Project posted successfully!");
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handlePlaceBid = (projectId, professional, ratePerHour) => {
    const project = projects.find(p => p.id === projectId);
    if (!ratePerHour || isNaN(ratePerHour)) {
      toast.error("Please enter a valid hourly rate");
      return;
    }
    if (project) {
      setProjects(projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            bids: [...p.bids, { professional, ratePerHour }],
          };
        }
        return p;
      }));
      setBidErrors({ ...bidErrors, [projectId]: "" });
      toast.success("Bid placed successfully!");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (authUser.trim()) {
      toast.success(`Welcome, ${authUser}!`);
    } else {
      toast.error("Please enter your name");
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(filter.toLowerCase()) ||
    project.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6" role="main">
      <a href="#content" className="sr-only focus:not-sr-only">Skip to content</a>

      <header className="max-w-4xl mx-auto mb-8" role="banner">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900" tabIndex={0}>Adhok V.1</h1>
            <p className="text-sm text-blue-600 font-medium">Get work done</p>
          </div>
        </div>
        <p className="text-gray-600">Connect with professionals and get your projects done.</p>
        <meta name="description" content="A platform where companies post projects and professionals bid to win contracts." />
        <meta property="og:title" content="Adhok V.1" />
        <meta property="og:description" content="Bid on company projects or post your own on this auction-style freelance marketplace." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://yourdomain.com" />
      </header>

      <div id="content" className="max-w-4xl mx-auto">
        {!authUser ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Welcome to Adhok</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter your name to get started
                  </label>
                  <Input
                    id="login-input"
                    placeholder="Your name"
                    value={authUser}
                    aria-label="Login input"
                    onChange={(e) => setAuthUser(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full">Start Bidding</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Post a New Project</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePostProject();
                  }}
                  className="space-y-4"
                  role="form"
                >
                  <div>
                    <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title
                    </label>
                    <Input
                      id="project-title"
                      placeholder="Enter project title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Project Description
                    </label>
                    <Textarea
                      id="project-description"
                      placeholder="Describe your project"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="project-deadline" className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline
                      </label>
                      <Input
                        id="project-deadline"
                        type="date"
                        value={newProject.deadline}
                        onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="project-min-hours" className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Project Hours
                      </label>
                      <Input
                        id="project-min-hours"
                        type="number"
                        placeholder="0"
                        value={newProject.minHours}
                        onChange={(e) => setNewProject({ ...newProject, minHours: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Post Project</Button>
                </form>
              </CardContent>
            </Card>

            <div className="mb-6">
              <Input
                placeholder="Search projects..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Search projects"
                className="max-w-md"
              />
            </div>

            <div className="space-y-6">
              {filteredProjects.map((project) => {
                const isDeadlinePassed = isBefore(project.deadline, new Date());
                return (
                  <Card key={project.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-semibold mb-2">{project.title}</h3>
                          <p className="text-gray-600 mb-4">{project.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            Deadline: {formatDistanceToNowStrict(project.deadline)} left
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            Minimum Hours: {project.minHours}
                          </p>
                        </div>
                      </div>

                      {!isDeadlinePassed && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-3">Place a Bid</h4>
                          <form
                            className="flex gap-3"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handlePlaceBid(project.id, authUser, bids[project.id]?.ratePerHour);
                            }}
                          >
                            <div className="relative max-w-[200px]">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                placeholder="Rate per hour"
                                type="number"
                                className="pl-7"
                                value={bids[project.id]?.ratePerHour || ""}
                                onChange={(e) => setBids({
                                  ...bids,
                                  [project.id]: {
                                    ...bids[project.id],
                                    ratePerHour: e.target.value,
                                  },
                                })}
                              />
                            </div>
                            <Button type="submit">Place Bid</Button>
                          </form>
                          {bidErrors[project.id] && (
                            <p className="text-red-500 text-sm mt-2">{bidErrors[project.id]}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-2">Current Bids</h4>
                        {project.bids.length > 0 ? (
                          <ul className="space-y-2">
                            {project.bids.map((bid, index) => (
                              <li key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                <span className="font-medium">{bid.professional}</span>
                                <span className="text-green-600">${bid.ratePerHour}/hr</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No bids yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No projects found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}