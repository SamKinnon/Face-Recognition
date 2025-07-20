"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Vote, Plus, Settings, BarChart3, CheckCircle, Clock, Play, Square, Eye } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [elections, setElections] = useState([])
  const [candidates, setCandidates] = useState([])
  const [voters, setVoters] = useState([])
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  })
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    party: "",
    description: "",
    electionId: "",
  })

  useEffect(() => {
    // Load mock data
    loadMockData()
  }, [])

  const loadMockData = () => {
    setElections([
      {
        id: 1,
        title: "Presidential Election 2024",
        description: "Choose the next President of Rwanda",
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() + 86400000),
        isActive: true,
        resultsPublished: false,
        totalVotes: 1247,
      },
      {
        id: 2,
        title: "Parliamentary Election 2024",
        description: "Select your parliamentary representatives",
        startTime: new Date(Date.now() + 604800000),
        endTime: new Date(Date.now() + 1209600000),
        isActive: false,
        resultsPublished: false,
        totalVotes: 0,
      },
    ])

    setCandidates([
      {
        id: 1,
        name: "Paul Kagame",
        party: "Rwanda Patriotic Front (RPF)",
        description: "Incumbent President, focusing on economic development and unity",
        electionId: 1,
        voteCount: 892,
      },
      {
        id: 2,
        name: "Frank Habineza",
        party: "Democratic Green Party of Rwanda (DGPR)",
        description: "Environmental advocate and democratic reform champion",
        electionId: 1,
        voteCount: 234,
      },
      {
        id: 3,
        name: "Philippe Mpayimana",
        party: "Independent",
        description: "Independent candidate promoting social justice and transparency",
        electionId: 1,
        voteCount: 121,
      },
    ])

    setVoters([
      {
        id: 1,
        nationalId: "1199780123456789",
        name: "Jean Baptiste Uwimana",
        province: "Kigali City",
        district: "Gasabo",
        registrationDate: "2024-01-15",
        hasVoted: true,
      },
      {
        id: 2,
        nationalId: "1198765432109876",
        name: "Marie Claire Mukamana",
        province: "Eastern Province",
        district: "Rwamagana",
        registrationDate: "2024-01-16",
        hasVoted: false,
      },
      {
        id: 3,
        nationalId: "1197654321098765",
        name: "David Nkurunziza",
        province: "Northern Province",
        district: "Musanze",
        registrationDate: "2024-01-17",
        hasVoted: true,
      },
    ])
  }

  const authenticateAdmin = () => {
    // Simple admin authentication (in real app, use proper authentication)
    if (adminPassword === "admin123") {
      setIsAdmin(true)
    } else {
      alert("Invalid admin password")
    }
  }

  const createElection = async () => {
    if (!newElection.title || !newElection.description || !newElection.startDate || !newElection.endDate) {
      alert("Please fill in all fields")
      return
    }

    const election = {
      id: elections.length + 1,
      title: newElection.title,
      description: newElection.description,
      startTime: new Date(newElection.startDate),
      endTime: new Date(newElection.endDate),
      isActive: false,
      resultsPublished: false,
      totalVotes: 0,
    }

    setElections([...elections, election])
    setNewElection({ title: "", description: "", startDate: "", endDate: "" })
    alert("Election created successfully!")
  }

  const addCandidate = async () => {
    if (!newCandidate.name || !newCandidate.party || !newCandidate.electionId) {
      alert("Please fill in all required fields")
      return
    }

    const candidate = {
      id: candidates.length + 1,
      name: newCandidate.name,
      party: newCandidate.party,
      description: newCandidate.description,
      electionId: Number.parseInt(newCandidate.electionId),
      voteCount: 0,
    }

    setCandidates([...candidates, candidate])
    setNewCandidate({ name: "", party: "", description: "", electionId: "" })
    alert("Candidate added successfully!")
  }

  const startElection = (electionId) => {
    setElections(elections.map((election) => (election.id === electionId ? { ...election, isActive: true } : election)))
    alert("Election started successfully!")
  }

  const endElection = (electionId) => {
    setElections(
      elections.map((election) => (election.id === electionId ? { ...election, isActive: false } : election)),
    )
    alert("Election ended successfully!")
  }

  const publishResults = (electionId) => {
    setElections(
      elections.map((election) => (election.id === electionId ? { ...election, resultsPublished: true } : election)),
    )
    alert("Results published successfully!")
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter admin password to access the control panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === "Enter" && authenticateAdmin()}
              />
            </div>
            <Button onClick={authenticateAdmin} className="w-full">
              Access Admin Panel
            </Button>
            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage elections, candidates, and voters</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Admin Authenticated
            </Badge>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="voters">Voters</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
                  <Vote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{elections.length}</div>
                  <p className="text-xs text-muted-foreground">{elections.filter((e) => e.isActive).length} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates.length}</div>
                  <p className="text-xs text-muted-foreground">Across all elections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Voters</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{voters.length}</div>
                  <p className="text-xs text-muted-foreground">{voters.filter((v) => v.hasVoted).length} have voted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {elections.reduce((sum, election) => sum + election.totalVotes, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all elections</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Presidential Election 2024 is active</p>
                        <p className="text-xs text-gray-500">1,247 votes cast so far</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">3 new voters registered today</p>
                        <p className="text-xs text-gray-500">Total: {voters.length} registered voters</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Parliamentary Election scheduled</p>
                        <p className="text-xs text-gray-500">Starts in 7 days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Blockchain Connection</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Face Recognition Service</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Connection</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Smart Contracts</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Deployed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="elections" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Elections Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Election
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Election</DialogTitle>
                    <DialogDescription>Set up a new election with title, description, and schedule.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Election Title</Label>
                      <Input
                        id="title"
                        value={newElection.title}
                        onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                        placeholder="e.g., Presidential Election 2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newElection.description}
                        onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                        placeholder="Brief description of the election"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date & Time</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newElection.startDate}
                          onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date & Time</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newElection.endDate}
                          onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={createElection} className="w-full">
                      Create Election
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {elections.map((election) => (
                <Card key={election.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{election.title}</span>
                          {election.isActive && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {election.resultsPublished && <Badge variant="outline">Results Published</Badge>}
                        </CardTitle>
                        <CardDescription>{election.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        {!election.isActive && !election.resultsPublished && (
                          <Button size="sm" onClick={() => startElection(election.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {election.isActive && (
                          <Button size="sm" variant="outline" onClick={() => endElection(election.id)}>
                            <Square className="h-4 w-4 mr-1" />
                            End
                          </Button>
                        )}
                        {!election.isActive && !election.resultsPublished && (
                          <Button size="sm" variant="outline" onClick={() => publishResults(election.id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Publish Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Start:</span>
                        <p className="text-gray-600">{new Date(election.startTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">End:</span>
                        <p className="text-gray-600">{new Date(election.endTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Total Votes:</span>
                        <p className="text-gray-600">{election.totalVotes}</p>
                      </div>
                      <div>
                        <span className="font-medium">Candidates:</span>
                        <p className="text-gray-600">{candidates.filter((c) => c.electionId === election.id).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Candidates Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Candidate</DialogTitle>
                    <DialogDescription>Register a new candidate for an election.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Candidate Name</Label>
                      <Input
                        id="candidateName"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                        placeholder="Full name of the candidate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="party">Political Party</Label>
                      <Input
                        id="party"
                        value={newCandidate.party}
                        onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                        placeholder="Political party or 'Independent'"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidateDescription">Description</Label>
                      <Textarea
                        id="candidateDescription"
                        value={newCandidate.description}
                        onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })}
                        placeholder="Brief description of the candidate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="electionSelect">Election</Label>
                      <select
                        id="electionSelect"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newCandidate.electionId}
                        onChange={(e) => setNewCandidate({ ...newCandidate, electionId: e.target.value })}
                      >
                        <option value="">Select an election</option>
                        {elections.map((election) => (
                          <option key={election.id} value={election.id}>
                            {election.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={addCandidate} className="w-full">
                      Add Candidate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Candidates</CardTitle>
                <CardDescription>Manage candidates across all elections</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Election</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => {
                      const election = elections.find((e) => e.id === candidate.electionId)
                      return (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell>{candidate.party}</TableCell>
                          <TableCell>{election?.title}</TableCell>
                          <TableCell>{candidate.voteCount}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voters" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Voters Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Export Voter List
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registered Voters</CardTitle>
                <CardDescription>View and manage registered voters</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>National ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Voting Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voters.map((voter) => (
                      <TableRow key={voter.id}>
                        <TableCell className="font-mono">{voter.nationalId}</TableCell>
                        <TableCell className="font-medium">{voter.name}</TableCell>
                        <TableCell>
                          {voter.province}, {voter.district}
                        </TableCell>
                        <TableCell>{new Date(voter.registrationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {voter.hasVoted ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Voted
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Not Voted
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <h2 className="text-2xl font-bold">Election Results</h2>

            {elections.map((election) => (
              <Card key={election.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{election.title}</span>
                    {election.resultsPublished ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Total Votes: {election.totalVotes} | Turnout:{" "}
                    {((election.totalVotes / voters.length) * 100).toFixed(1)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidates
                      .filter((c) => c.electionId === election.id)
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((candidate, index) => {
                        const percentage =
                          election.totalVotes > 0 ? ((candidate.voteCount / election.totalVotes) * 100).toFixed(1) : 0
                        return (
                          <div key={candidate.id} className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <div>
                                  <span className="font-medium">{candidate.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">({candidate.party})</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold">{candidate.voteCount}</span>
                                  <span className="text-sm text-gray-500 ml-1">({percentage}%)</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
