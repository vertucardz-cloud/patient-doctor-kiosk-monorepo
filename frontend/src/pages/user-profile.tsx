import { useState } from "react";
import {useLocation } from 'react-router-dom';

import {
  Box,
  Tab,
  Card,
  Tabs,
  Grid,
  Avatar,
  Button,
  TextField,
  Typography,
  CardContent,
} from "@mui/material";

type UserProps = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    avatarUrl?: string;
    bio?: string;
    address?: string;
  };

type UserProfileProps = {
  user: UserProps;
  onSave?: (updatedUser: any) => void;
};

export default function UserProfile() {

    const location = useLocation();
  const user1 = location.state as UserProps;

    const [user, setUser] = useState(user1 as UserProps);
    const [tab, setTab] = useState(0);
    const [formData, setFormData] = useState<UserProps>({
        id: "",
        name: "",
        email: "",
        phone: "",
        role: "",
        avatarUrl: "",
        bio: "",
        address: "",
    });
    
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSave = () => {
        // save data directly backend
        console.log('------------------------------',formData);
    };


    if(!user) {
        return <> User not exist</>
    }

  return (
    <Card
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 4,
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" flexDirection="column" mb={3}>
          <Avatar
            src={user?.avatarUrl}
            alt={user.name}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.role || "User"}
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Profile" />
          <Tab label="Edit" />
        </Tabs>

        {/* Profile View */}
        {tab === 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography mb={2}>{user.email}</Typography>

            {user.phone && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography mb={2}>{user.phone}</Typography>
              </>
            )}

            {user.address && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography mb={2}>{user.address}</Typography>
              </>
            )}

            {user.bio && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  About
                </Typography>
                <Typography>{user.bio}</Typography>
              </>
            )}
          </Box>
        )}

        {/* Edit Form */}
        {tab === 1 && (
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Role"
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>

            <Box textAlign="right" mt={2}>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
